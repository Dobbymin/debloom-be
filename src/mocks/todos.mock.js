export const TODO_MOCK = [
  {
    date: '2025-12-20',
    totalTodosCount: 2,
    categories: [
      {
        categoryId: 2,
        name: '개인 공부',
        todos: [
          {
            todosId: 1,
            content: '리액트 공식 문서 읽기',
            isCompleted: false,
          },
          {
            todosId: 2,
            content: '타입스크립트 제네릭 복습',
            isCompleted: true,
          },
        ],
      },
    ],
  },
  {
    date: '2025-12-21',
    totalTodosCount: 2,
    categories: [
      {
        categoryId: 3,
        name: '운동',
        todos: [
          {
            todosId: 3,
            content: '스쿼트 100개',
            isCompleted: false,
          },
          {
            todosId: 4,
            content: '런닝 30분',
            isCompleted: false,
          },
        ],
      },
    ],
  },
  {
    date: '2025-12-23',
    totalTodosCount: 3,
    categories: [
      {
        categoryId: 4,
        name: '장보기',
        todos: [
          {
            todosId: 5,
            content: '우유 사기',
            isCompleted: true,
          },
        ],
      },
      {
        categoryId: 5,
        name: '청소',
        todos: [
          {
            todosId: 6,
            content: '방 청소하기',
            isCompleted: false,
          },
          {
            todosId: 7,
            content: '분리수거 하기',
            isCompleted: false,
          },
        ],
      },
    ],
  },
];
