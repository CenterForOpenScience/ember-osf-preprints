export default function pathJoin() {
	let last = (str) => str.slice(str.length - 1) === '/';
	let first = (str) => str.slice(0, 1) === '/';
	let p = arguments[0];

	for (var i = 1; i < arguments.length; i++) {
		let cur = arguments[i];
        if (last(p)) {
			if (first(cur)) {
				p = p + cur.slice(1);
			} else {
				p = p + cur;
			}
		} else if (first(cur)) {
			p = p + cur;
		} else {
			p = p + '/' + cur;
		}
	}
	return p;
}
