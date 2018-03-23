import route from '../../content/index';

route.reopen({
    controllerName: 'content.index',
    renderTemplate(controller, model) {
        this.render('content.index', {
            controller,
            model,
        });
    },
});

export default route;
