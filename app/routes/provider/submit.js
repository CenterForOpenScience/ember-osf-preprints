import route from '../submit';

route.reopen({
    controllerName: 'submit',
    renderTemplate(controller, model) {
        this.render('submit', {
            controller,
            model,
        });
    },
});

export default route;
