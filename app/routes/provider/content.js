import route from '../content';

route.reopen({
    controllerName: 'content',
    renderTemplate: function(controller, model) {
        this.render('content', {
            controller,
            model
        });
    },
});

export default route;
