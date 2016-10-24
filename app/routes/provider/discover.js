import route from '../discover';

route.reopen({
    controllerName: 'discover',
    renderTemplate: function(controller, model) {
        this.render('discover', {
            controller,
            model
        });
    }
});

export default route;
