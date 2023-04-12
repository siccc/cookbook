import {
  createMockVercelRequest,
  createMockVercelResponse,
  createUser,
  deleteUser
} from './helpers';
import userApiHandler from '../../api/user';
import verifyRecaptcha from '../../api/_verifyRecaptcha';
import type { Mock } from 'vitest';

const recaptchaToken = '123';

vi.mock('../../api/_verifyRecaptcha', () => {
  return {
    default: vi.fn(async (recaptchaToken) => {
      return {
        success: true,
        'error-codes': []
      }
    })
  }
});

describe('user', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user and delete it', async () => {
    const createUserReq = createMockVercelRequest({
      method: 'POST',
      url: '/api/user',
      body: {
        recaptchaToken: recaptchaToken,
        isDemoUser: false
      }
    });
    const createUserRes = createMockVercelResponse();

    await userApiHandler(createUserReq, createUserRes);

    expect(verifyRecaptcha).toBeCalledTimes(1);
    expect(createUserRes.status).toBeCalledTimes(1);
    expect(createUserRes.status).toHaveBeenCalledWith(200);
    expect(createUserRes.json).toBeCalledTimes(1);
    // console.log(createUserRes.json.mock.calls[0][0]);

    const user = createUserRes.json.mock.calls[0][0];

    const deleteUserReq = createMockVercelRequest({
      method: 'DELETE',
      url: '/api/user',
      query: {
        id: user.id
      }
    });

    const deleteUserRes = createMockVercelResponse();

    await userApiHandler(deleteUserReq, deleteUserRes);

    expect(deleteUserRes.status).toBeCalledTimes(1);
    expect(deleteUserRes.status).toHaveBeenCalledWith(200);
    expect(deleteUserRes.send).toBeCalledTimes(1);
    expect(deleteUserRes.send).toHaveBeenCalledWith('User deleted.');
  });

  it('should return error if there is no recaptcha token', async () => {
    const req = createMockVercelRequest({
      method: 'POST',
      url: '/api/user',
      body: {
        isDemoUser: false
      }
    });
    const res = createMockVercelResponse();

    await userApiHandler(req, res);
    expect(verifyRecaptcha).toBeCalledTimes(0);
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toBeCalledTimes(1);
  });

  it('should return error if recaptcha token is invalid', async () => {
    (verifyRecaptcha as Mock).mockResolvedValueOnce({
      success: false,
      'error-codes': ['mock error']
    });

    const req = createMockVercelRequest({
      method: 'POST',
      url: '/api/user',
      body: {
        recaptchaToken: '123',
        isDemoUser: false
      }
    });
    const res = createMockVercelResponse();

    await userApiHandler(req, res);

    expect(verifyRecaptcha).toBeCalledTimes(1);
    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toBeCalledTimes(1);
  });

  it('should get a user', async () => {
    const req = createMockVercelRequest({
      method: 'GET',
      url: '/api/user',
      query: {
        id: 'e9c48a34a46c8'
      }
    });
    const res = createMockVercelResponse();

    await userApiHandler(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json.mock.calls[0][0]).toHaveProperty('id');
  });

  it('should return error if there is no user id when getting the user', async () => {
    const req = createMockVercelRequest({
      method: 'GET',
      url: '/api/user'
    });
    const res = createMockVercelResponse();

    await userApiHandler(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toBeCalledTimes(1);
  });

  it('should return error if there is no user id when deleting the user', async () => {
    const req = createMockVercelRequest({
      method: 'DELETE',
      url: '/api/user'
    });
    const res = createMockVercelResponse();

    await userApiHandler(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toBeCalledTimes(1);
  });

  it('should create and delete a user with helpers', async () => {
    const user = await createUser(recaptchaToken, false);
    expect(user.id).toBeTruthy();

    if (user) {
      const res = await deleteUser(user.id);
      expect(res).toBe('User deleted.');
    }
  });
});
