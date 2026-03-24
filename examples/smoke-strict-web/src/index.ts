import { Button } from "./components/Button.js";
import { Form } from "./components/Form.js";

export const strictWebSmokeId = "strict-web";

export const readComponentNames = (): ReadonlyArray<string> => [
	Button.name,
	Form.name,
];
