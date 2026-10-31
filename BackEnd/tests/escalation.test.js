const Complaints = require('../src/models/complaint.model');
const Departments = require('../src/models/department.model');
const { adminModel: Admins } = require('../src/models/user.model');
const { runEscalation } = require('../src/jobs/escalation.job');

const chain = (v) => ({ select: () => ({ lean: async () => v }) });
afterEach(() => jest.restoreAllMocks());

describe('escalation job', () => {
  const now = new Date('2026-10-27T00:00:00Z');

  test('one updateMany per department, using each department\'s own threshold (default 7 days)', async () => {
    jest.spyOn(Admins, 'findOne').mockReturnValue(chain({ _id: 'admin1' }));
    jest.spyOn(Departments, 'find').mockReturnValue(chain([{ branchName: 'CSE', escalationDays: 5 }, { branchName: 'ECE' }]));
    const update = jest.spyOn(Complaints, 'updateMany').mockResolvedValue({ modifiedCount: 2 });

    const result = await runEscalation(now);
    expect(result).toEqual({ escalated: 4 });
    expect(update).toHaveBeenCalledTimes(2);

    const [cseFilter, cseChange] = update.mock.calls[0];
    expect(cseFilter.branchName).toBe('CSE');
    expect(cseFilter.createdAt.$lt).toEqual(new Date('2026-10-22T00:00:00Z'));
    expect(cseFilter.status.$nin).toEqual(expect.arrayContaining(['Resolved', 'Closed', 'Re-Assigned', 'Escalated']));
    expect(cseChange.$set).toMatchObject({ status: 'Escalated', escalatedTo: 'admin1', escalatedBy: 'admin1', escalatedAt: now });
    expect(update.mock.calls[1][0].createdAt.$lt).toEqual(new Date('2026-10-20T00:00:00Z'));
  });

  test('does nothing (and does not crash) when no admin exists', async () => {
    jest.spyOn(Admins, 'findOne').mockReturnValue(chain(null));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const update = jest.spyOn(Complaints, 'updateMany');
    expect(await runEscalation(now)).toEqual({ escalated: 0 });
    expect(update).not.toHaveBeenCalled();
  });
});
