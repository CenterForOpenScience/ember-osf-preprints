export default function(location, domain, slug) {
    const pathRegex = new RegExp(`^/preprints(/${slug})?`);
    const {pathname, host, origin} = location;
    const newOrigin = origin.replace(host, domain);
    const newPath = pathname.replace(pathRegex, '');

    return `${newOrigin}${newPath}`;
}
