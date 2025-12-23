import dayjs from 'dayjs';

import { supabase } from '../../../db/supabase.js';

export class TodosRepository {
  async findAll() {
    // todo_groups를 기준으로 조회하여 todos가 없는 그룹도 포함
    const { data, error } = await supabase
      .from('todo_groups')
      .select(
        `
        id,
        todo_date,
        category_id,
        categories (
          id,
          name,
          created_at
        ),
        todos (
          id,
          content,
          is_completed
        )
      `
      )
      .order('todo_date', { ascending: true })
      .order('category_id', { ascending: true })
      .order('id', { foreignTable: 'todos', ascending: true }); // todos 정렬

    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    const rows = data || [];

    // 날짜별로 그룹핑
    const dateMap = new Map(); // key: date string -> { date, totalTodosCount, categories: [] }

    for (const group of rows) {
      const dateKey = group.todo_date;
      let dateGroup = dateMap.get(dateKey);
      if (!dateGroup) {
        dateGroup = { date: dateKey, totalTodosCount: 0, categories: [] };
        dateMap.set(dateKey, dateGroup);
      }

      // 각 그룹(todo_group)은 하나의 카테고리에 해당
      const categoryData = {
        categoryId: group.categories.id,
        name: group.categories.name,
        categoryCreatedAt: group.categories.created_at,
        todos: (group.todos || []).map((t) => ({
          todosId: t.id,
          content: t.content,
          isCompleted: t.is_completed,
        })),
      };

      dateGroup.categories.push(categoryData);
      dateGroup.totalTodosCount += categoryData.todos.length;
    }

    return Array.from(dateMap.values());
  }

  async findByDate(targetDate) {
    // 특정 날짜의 todo_groups 조회 (todos가 없어도 포함)
    const { data, error } = await supabase
      .from('todo_groups')
      .select(
        `
        id,
        todo_date,
        category_id,
        categories (
          id,
          name,
          created_at
        ),
        todos (
          id,
          content,
          is_completed
        )
      `
      )
      .eq('todo_date', targetDate)
      .order('category_id', { ascending: true })
      .order('id', { foreignTable: 'todos', ascending: true });

    if (error) throw new Error(`Supabase query failed: ${error.message}`);

    const groups = data || [];

    if (groups.length === 0) {
      // 해당 날짜에 그룹 자체가 없으면 빈 배열 반환 (날짜 객체도 없는지, 아니면 빈 날짜 객체인지 확인 필요. 기존 로직은 빈배열)
      // 기존: return []
      return [];
    }

    let totalTodosCount = 0;
    const categories = groups.map((group) => {
      const mappedTodos = (group.todos || []).map((t) => ({
        todosId: t.id,
        content: t.content,
        isCompleted: t.is_completed,
      }));
      totalTodosCount += mappedTodos.length;

      return {
        categoryId: group.categories.id,
        name: group.categories.name,
        categoryCreatedAt: group.categories.created_at,
        todos: mappedTodos,
      };
    });

    return [
      {
        date: targetDate,
        totalTodosCount,
        categories,
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
