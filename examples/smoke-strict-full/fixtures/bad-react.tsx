type CardProps = {
	readonly tags: ReadonlyArray<string>;
};

const StaticCard = ({ tags }: CardProps): JSX.Element => <section>{tags.join(", ")}</section>;

const names = ["Ada Lovelace", "Grace Hopper", "Mary Jackson"];

export const BrokenRoster = (): JSX.Element => (
	<section>
		<img src="/ada.png" />
		{names.map((name, index) => (
			<StaticCard key={index} tags={["roster", name]} />
		))}
	</section>
);

export const BrokenInlineObject = (): JSX.Element => (
	<StaticCard tags={{ label: "invalid" } as never} />
);
