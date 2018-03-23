import route from '../discover';

route.reopen({
    controllerName: 'discover',
    renderTemplate(controller, model) {
        this.render('discover', {
            controller,
            model,
        });
    },
});

export default route;
