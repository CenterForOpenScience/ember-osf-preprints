import route from '../../content/withdraw';

route.reopen({
    controllerName: 'content.withdraw',
    renderTemplate(controller, model) {
        this.render('content.withdraw', {
            controller,
            model,
        });
    },
});

export default route;
