import route from '../discover';

route.reopen({
    controllerName: 'discover',
    renderTemplate(controller, model) {
        const providers = model.preprintProviders;
        this.render('discover', {
            controller,
            providers,
        });
    },
});

export default route;
