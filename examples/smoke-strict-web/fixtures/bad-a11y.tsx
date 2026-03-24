export const BadImage = (): unknown => <img src="photo.jpg" />;

export const BadClick = (): unknown => (
	<div onClick={() => {}} role="button">click me</div>
);

export const BadTabIndex = (): unknown => <div tabIndex={3}>Focusable</div>;

export const BadHeading = (): unknown => <h1></h1>;
