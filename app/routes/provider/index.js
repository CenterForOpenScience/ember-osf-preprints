import route from '../index';

route.reopen({
    model() {
        return this.store
            .query('taxonomy', { filter: { parents: 'null' }, page: { size: 20 } });
    },
    controllerName: 'index',
    renderTemplate(controller, model) {
        this.render('index', {
            controller,
            model
        });
    }
});

export default route;
