import route from '../index';

route.reopen({
    controllerName: 'index',
    renderTemplate(controller, model) {
        this.render('index', {
            controller,
            model,
        });
    },
});

export default route;
