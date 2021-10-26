import * as fromSetting from './setting.actions';

describe('setSettings', () => {
  it('should return an action', () => {
    expect(fromSetting.setSettings().type).toBe('[Setting] Set Settings');
  });
});
