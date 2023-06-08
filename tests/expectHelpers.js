function expectNotToBeError(body) {
  expect(body).not.toEqual({
    message: expect.any(String),
    name: expect.any(String),
    error: expect.any(String),
  });
}

function expectToBeError(body) {
  expect(body).toEqual({
    message: expect.any(String),
    name: expect.any(String),
    error: expect.any(String),
  });
}

function expectToHaveErrorMessage(body, message) {
  expect(body).toEqual({
    error: expect.any(String),
    name: expect.any(String),
    message,
  });
}

module.exports = {
  expectToBeError,
  expectNotToBeError,
  expectToHaveErrorMessage,
};
