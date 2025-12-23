export class CustomError extends Error {
  /**
   * @param {string} code 에러 코드 (예: 'CLIP_NOT_FOUND')
   * @param {string} message 에러 메시지
   * @param {number} statusCode HTTP 상태 코드
   */
  constructor(code, message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = code; // 컨트롤러에서 error.name으로 코드 사용
  }
}
