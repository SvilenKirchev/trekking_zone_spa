import {getPartials, setHeaderInfo} from "./scripts/shared.js";
import { get, put, del, post } from "./scripts/requester.js";
import { getLogin, postLogin, getRegister, postRegister, logout } from "./scripts/auth-handlers.js"

const app = Sammy('body', function () {
    this.use('Handlebars', 'hbs');

    this.get('#/home', function (context) {
        setHeaderInfo(context);
        if (context.isAuth){
            get('Kinvey', 'appdata', 'treks')
                .then((treks) => {
                    if (treks.length > 0){
                        context.treks = treks;
                        this.loadPartials(getPartials())
                            .partial('./views/homeWithTreks.hbs')
                    }else {
                     context.treks = treks;
                     this.loadPartials(getPartials())
                         .partial('./views/homeNoTreks.hbs')
                    }
                })
        } else {
            this.loadPartials(getPartials())
                .partial('./views/home.hbs')
        }
    });

    this.get('#/register', getRegister);
    this.post('#/register', postRegister);

    this.get('#/login', getLogin);
    this.post('#/login', postLogin);

    this.get('#/logout', logout);

    this.get('#/profile', function (context) {
        setHeaderInfo(context);
        this.loadPartials(getPartials())
            .partial('./views/user/profile.hbs')
    });

    this.get('#/create', function (context) {
        setHeaderInfo(context);
        this.loadPartials(getPartials())
            .partial('./views/trek/create.hbs');
    });
    this.post('#/create', function (context) {
        const { location, dateTime, description, imageURL } = context.params;

        if (location && dateTime && description && imageURL){
            post('Kinvey', 'appdata', 'treks', {
                location,
                dateTime,
                description,
                imageURL,
                likesCounter: 0,
            }).then(() => {
                context.redirect('#/home');
            }).catch(console.error);
        }
    });

    this.get('#/details/:id', function (context) {
        const id = context.params.id;
        setHeaderInfo(context);

        get('Kinvey', 'appdata', `treks/${id}`)
            .then((trek) => {
                trek.isCreator = sessionStorage.getItem('userId') === trek._acl.creator;
                context.trek = trek;
                console.log(trek)
                this.loadPartials(getPartials())
                    .partial('./views/trek/details.hbs')
            }).catch(console.log)
    });

    this.get('#/edit/:id', function (context) {
        const id = context.params.id;
        setHeaderInfo(context);

        get('Kinvey', 'appdata', `treks/${id}`)
            .then((trek) => {
                context.trek = trek;

                this.loadPartials(getPartials())
                    .partial('./views/trek/edit.hbs')
            })
    });
    this.post('#/edit/:id', function (context) {
        const id = context.params.id;
        const { location, dateTime, description, imageURL } = context.params;

        put('Kinvey', 'appdata', `treks/${id}`, {
            location,
            dateTime,
            description,
            imageURL,
        }).then(() => {
            context.redirect('#/home');
        }).catch(console.error);
    });

    this.get('#/delete/:id', function (context) {
        const id = context.params.id;
        setHeaderInfo(context);

        del('Kinvey', 'appdata', `treks/${id}`)
            .then(() => {
                context.redirect('#/home')
            })
    });

    this.post('#/like/:id' , function (context) {
        const id = context.params.id;
        const { location, dateTime, description, imageURL, likesCounter } = context.params;
        context.likesCounter++;

        put('Kinvey', 'appdata', `treks/${id}`, {
            location,
            dateTime,
            description,
            imageURL,
            likesCounter
        }).then(() => {
            context.redirect('#/home');
        }).catch(console.error);
    })
});

app.run('#/home');