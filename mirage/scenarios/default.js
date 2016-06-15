export default function(server) {
    server.loadFixtures('subjects');
    server.loadFixtures('preprints');
    server.loadFixtures('taxonomies');
}
