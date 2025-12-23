/**
 * @swagger
 * tags:
 *   name: Todos
 *   description: 투두 관리 API
 */

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: 투두 목록 조회
 *     description: 특정 날짜의 투두 목록을 조회합니다. (그룹별로 묶여서 반환)
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: date
 *         required: false
 *         description: 조회할 날짜 (Format YYYY-MM-DD). 없을 경우 전체 조회 또는 빈 목록.
 *         schema:
 *           type: string
 *           example: "2025-12-24"
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2025-12-24"
 *                           totalTodosCount:
 *                             type: number
 *                             example: 3
 *                           categories:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 categoryId:
 *                                   type: number
 *                                 name:
 *                                   type: string
 *                                 categoryCreatedAt:
 *                                   type: string
 *                                 todos:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       todosId:
 *                                         type: number
 *                                       content:
 *                                         type: string
 *                                       isCompleted:
 *                                         type: boolean
 *                     status:
 *                       type: string
 *                       example: "SUCCESS"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailResponse'
 *
 *   post:
 *     summary: 투두 생성
 *     description: 새로운 투두를 생성합니다. (필요 시 카테고리/그룹도 자동 생성)
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - todoDate
 *               - content
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "업무"
 *               todoDate:
 *                 type: string
 *                 example: "2025-12-24"
 *               content:
 *                 type: string
 *                 example: "프로젝트 기획서 작성"
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todosId:
 *                           type: number
 *                         content:
 *                           type: string
 *                         isCompleted:
 *                           type: boolean
 *                         categoryId:
 *                           type: number
 *                         categoryName:
 *                           type: string
 *       400:
 *         description: 유효성 검사 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailResponse'
 */

/**
 * @swagger
 * /api/todos/monthly:
 *   get:
 *     summary: 월별 투두 개수 조회
 *     description: 특정 월의 날짜별 투두 개수를 조회합니다.
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         description: 조회할 월 (Format YYYY-MM)
 *         schema:
 *           type: string
 *           example: "2025-12"
 *     responses:
 *       200:
 *         description: 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2025-12-01"
 *                           todosCount:
 *                             type: number
 *                             example: 5
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailResponse'
 */

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: 투두 수정
 *     description: 투두의 내용 또는 완료 여부를 수정합니다.
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 수정할 투두의 ID
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               isCompleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         todosId:
 *                           type: number
 *                         content:
 *                           type: string
 *                         isCompleted:
 *                           type: boolean
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailResponse'
 *       404:
 *         description: 투두 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailResponse'
 */

/**
 * @swagger
 * /api/todos/groups:
 *   post:
 *     summary: 투두 그룹(카테고리) 생성
 *     description: 특정 날짜에 새로운 카테고리(그룹)를 생성합니다. (투두 없이 그룹만 생성)
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - categoryName
 *               - todoDate
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "운동"
 *               todoDate:
 *                 type: string
 *                 example: "2025-12-24"
 *     responses:
 *       201:
 *         description: 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         groupId:
 *                           type: number
 *                         categoryId:
 *                           type: number
 *                         categoryName:
 *                           type: string
 *                         todoDate:
 *                           type: string
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FailResponse'
 */
