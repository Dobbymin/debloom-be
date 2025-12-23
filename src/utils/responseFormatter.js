/**
 * 성공 응답 객체를 생성합니다.
 * @param {any} data 클라이언트에게 전달할 데이터
 * @returns {{data: any, status: string, serverDateTime: string, errorCode: null, errorMessage: null}}
 */
export const createSuccessResponse = (data) => {
  return {
    data,
    status: 'SUCCESS',
    serverDateTime: new Date().toISOString(),
    errorCode: null,
    errorMessage: null,
  };
};

/**
 * 실패 응답 객체를 생성합니다.
 * @param {string} errorCode 에러 코드
 * @param {string} errorMessage 에러 메시지
 * @returns {{data: null, status: string, serverDateTime: string, errorCode: string, errorMessage: string}}
 */
export const createErrorResponse = (errorCode, errorMessage) => {
  return {
    data: null,
    status: 'ERROR',
    serverDateTime: new Date().toISOString(),
    errorCode,
    errorMessage,
  };
};
