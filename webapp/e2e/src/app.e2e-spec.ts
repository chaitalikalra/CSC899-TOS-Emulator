import { AppPage } from './app.po';
import { browser, logging, } from 'protractor';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('app title should be on top', () => {
    page.navigateTo();
    expect(page.getAppTitle()).toEqual('TOS x86 Emulator');
  });

  it('clear button should clear browser', () => {
    page.navigateTo();
    expect(page.getCodeInEditor()).toEqual('Type some code here');
    page.clearCode().then(() => {
      expect(page.getCodeInEditor()).toEqual('');
    });
  });

  it('code from uploaded file should be added in code editor', () => {
    page.navigateTo();
    page.uploadInvalidCode().then(() => {
      expect(page.getCodeInEditor()).toEqual('this is a test file');
    })
  });

  it('invalid code will not assemble', () => {
    page.navigateTo();
    page.uploadInvalidCode().then(() => {
      return page.assembleCode(); 
    }).then(() => {
      expect(page.isAssembleError()).toEqual(true);
    });
  });

  it('check buttons on assemble page', () => {
    page.navigateTo();
    expect(page.isClearButtonDisplayed()).toEqual(true);
    expect(page.isAssembleButtonDisplayed()).toEqual(true);
    expect(page.isBrowseButtonDisplayed()).toEqual(true);
    expect(page.isSlideExampleDropdownDisplayed()).toEqual(true);
  });

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
