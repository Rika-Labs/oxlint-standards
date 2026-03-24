const items = [1, 2, 3];

type ActionButtonProps = {
	readonly onSelect: () => void;
};

const ActionButton = ({ onSelect }: ActionButtonProps): JSX.Element => (
	<button type="button" onClick={onSelect}>
		Open
	</button>
);

export const BadKeys = (): unknown => (
	<ul>
		{items.map((item, index) => (
			<li key={index}>{item}</li>
		))}
	</ul>
);

export const BadInlineProp = (): unknown => (
	<ActionButton onSelect={() => {}} />
);

export const BadDangerousMarkup = (): unknown => (
	<section dangerouslySetInnerHTML={{ __html: "<p>unsafe</p>" }} />
);
