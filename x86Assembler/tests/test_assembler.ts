import { Expect, Test } from "alsatian";

export class ExampleTestFixture {

    @Test()
    public exampleTest() {
      Expect(1 + 1).toBe(2);
    }
  }