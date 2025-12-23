import dayjs from 'dayjs';

import { supabase } from '../../../db/supabase.js';

export class TodosRepository {
  async findAll() {
    // Supabase에서 평탄화된 뷰를 조회합니다.
    const { data, error } = await supabase
      .from('todos_view_flat')
      .select('categoryId, todoDate, name, categoryCreatedAt, todosId, content, isCompleted')
      .order('todoDate', { ascending: true })
      .order('categoryId', { ascending: true })
      .order('todosId', { ascending: true });

    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    const rows = data || [];

    // 날짜(date) 단위로 그룹핑하고, 각 날짜 내에서 카테고리별로 하위 그룹핑
    const dateMap = new Map(); // key: date string -> { date, totalTodosCount, categories: [] }

    for (const row of rows) {
      const dateKey = row.todoDate;
      let dateGroup = dateMap.get(dateKey);
      if (!dateGroup) {
        dateGroup = { date: dateKey, totalTodosCount: 0, categories: [], _catMap: new Map() };
        dateMap.set(dateKey, dateGroup);
      }

      let catGroup = dateGroup._catMap.get(row.categoryId);
      if (!catGroup) {
        catGroup = {
          categoryId: row.categoryId,
          name: row.name,
          categoryCreatedAt: row.categoryCreatedAt,
          todos: [],
        };
        dateGroup._catMap.set(row.categoryId, catGroup);
        dateGroup.categories.push(catGroup);
      }

      catGroup.todos.push({ todosId: row.todosId, content: row.content, isCompleted: row.isCompleted });
      dateGroup.totalTodosCount += 1;
    }

    // 정렬: 날짜 오름차순
    const groupedByDate = Array.from(dateMap.values())
      .map(({ _catMap, ...rest }) => rest)
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

    return groupedByDate;
  }

  async findByDate(targetDate) {
    // 특정 날짜의 todos만 조회
    const { data, error } = await supabase
      .from('todos_view_flat')
      .select('categoryId, todoDate, name, categoryCreatedAt, todosId, content, isCompleted')
      .eq('todoDate', targetDate)
      .order('categoryId', { ascending: true })
      .order('todosId', { ascending: true });

    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    const rows = data || [];

    if (rows.length === 0) {
      return [];
    }

    // 해당 날짜의 데이터를 카테고리별로 그룹핑
    const categoryMap = new Map();
    let totalTodosCount = 0;

    for (const row of rows) {
      let catGroup = categoryMap.get(row.categoryId);
      if (!catGroup) {
        catGroup = {
          categoryId: row.categoryId,
          name: row.name,
          categoryCreatedAt: row.categoryCreatedAt,
          todos: [],
        };
        categoryMap.set(row.categoryId, catGroup);
      }
      catGroup.todos.push({ todosId: row.todosId, content: row.content, isCompleted: row.isCompleted });
      totalTodosCount += 1;
    }

    return [
      {
        date: targetDate,
        totalTodosCount,
        categories: Array.from(categoryMap.values()),
      },
    ];
  }

  async createTodo(categoryName, todoDate, content) {
    // 그룹을 찾거나 생성 (카테고리는 이름으로 생성/조회)
    const { groupId, categoryId, categoryCreatedAt } = await this.createTodoGroup(categoryName, todoDate);

    // 새 todo 삽입
    const { data, error } = await supabase
      .from('todos')
      .insert([{ group_id: groupId, content, is_completed: false }])
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create todo: ${error.message}`);

    return {
      todosId: data.id,
      content,
      isCompleted: false,
      categoryId,
      categoryName,
      categoryCreatedAt,
      todoDate,
    };
  }

  async updateTodo(todosId, updates) {
    // todosId가 존재하는지 확인 및 현재 그룹 ID 조회
    const { data: existingTodo, error: selectError } = await supabase
      .from('todos')
      .select('id, group_id, content, is_completed')
      .eq('id', todosId)
      .single();

    if (selectError || !existingTodo) {
      throw new Error(`Todo not found: ${todosId}`);
    }

    // 업데이트 필드 구성 (null이 아닌 필드만)
    const updateData = {};
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;

    if (Object.keys(updateData).length === 0) {
      throw new Error('No fields to update');
    }

    const { error: updateError } = await supabase.from('todos').update(updateData).eq('id', todosId);

    if (updateError) throw new Error(`Failed to update todo: ${updateError.message}`);

    // 업데이트된 todo 반환
    const { data: updatedTodo, error: fetchError } = await supabase
      .from('todos')
      .select('id, content, is_completed')
      .eq('id', todosId)
      .single();

    if (fetchError) throw new Error(`Failed to fetch updated todo: ${fetchError.message}`);

    return {
      todosId: updatedTodo.id,
      content: updatedTodo.content,
      isCompleted: updatedTodo.is_completed,
    };
  }

  async createTodoGroup(categoryName, todoDate) {
    if (!categoryName) {
      throw new Error('categoryName is required');
    }

    // 카테고리 조회 또는 생성
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id, created_at')
      .eq('name', categoryName)
      .maybeSingle();

    let categoryId = existingCategory?.id;
    let categoryCreatedAt = existingCategory?.created_at;

    if (!categoryId) {
      const { data: createdCategory, error: categoryInsertError } = await supabase
        .from('categories')
        .insert([{ name: categoryName, created_at: todoDate }])
        .select('id, created_at')
        .single();

      if (categoryInsertError) {
        throw new Error(`Failed to create category: ${categoryInsertError.message}`);
      }

      categoryId = createdCategory.id;
      categoryCreatedAt = createdCategory.created_at;
    }

    // 그룹이 이미 존재하는지 확인
    const { data: existingGroup, error: existError } = await supabase
      .from('todo_groups')
      .select('id')
      .eq('category_id', categoryId)
      .eq('todo_date', todoDate)
      .single();

    if (existingGroup) {
      return { groupId: existingGroup.id, categoryId, categoryCreatedAt, todoDate, categoryName };
    }

    // 새 그룹 삽입
    const { data, error } = await supabase
      .from('todo_groups')
      .insert([{ category_id: categoryId, todo_date: todoDate }])
      .select('id')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116은 중복 키 에러인데, 이는 동시에 삽입된 경우 발생 가능
      throw new Error(`Failed to create todo group: ${error.message}`);
    }

    // 중복 삽입된 경우 다시 조회
    if (!data) {
      const { data: refetchData } = await supabase
        .from('todo_groups')
        .select('id')
        .eq('category_id', categoryId)
        .eq('todo_date', todoDate)
        .single();
      return { groupId: refetchData.id, categoryId, categoryCreatedAt, todoDate, categoryName };
    }

    return { groupId: data.id, categoryId, categoryCreatedAt, todoDate, categoryName };
  }

  async countTodosByMonth(month) {
    const startDate = dayjs(`${month}-01`).startOf('day');
    if (!startDate.isValid()) {
      throw new Error('Invalid month');
    }
    const daysInMonth = startDate.daysInMonth();
    const endDate = startDate.add(daysInMonth - 1, 'day');

    const { data, error } = await supabase
      .from('todos_view_flat')
      .select('todoDate')
      .gte('todoDate', startDate.format('YYYY-MM-DD'))
      .lte('todoDate', endDate.format('YYYY-MM-DD'));

    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    const countsByDate = new Map();
    for (const row of data || []) {
      const current = countsByDate.get(row.todoDate) || 0;
      countsByDate.set(row.todoDate, current + 1);
    }

    const result = [];
    for (let i = 0; i < daysInMonth; i += 1) {
      const dateStr = startDate.add(i, 'day').format('YYYY-MM-DD');
      result.push({ date: dateStr, todosCount: countsByDate.get(dateStr) || 0 });
    }

    return result;
  }
}
