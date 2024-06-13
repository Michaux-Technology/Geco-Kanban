const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user'); // Supposant que vous avez un modèle User

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email });
        if (!user) return done(null, false, { message: 'Email not registered' });
        // Comparez le mot de passe ici avec celui de la base de données
        // (en supposant que vous utilisez des mots de passe hachés)
        // Utilisez bcrypt ou un autre paquet pour cela.
        if (password === user.password) return done(null, user);  // Simplification pour la démo
        return done(null, false, { message: 'Password incorrect' });
    } catch (error) {
        return done(error);
    }
}));


passport.use(new GoogleStrategy({
    clientID: 'YOUR_GOOGLE_CLIENT_ID',
    clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/auth/google/callback'
},
    (accessToken, refreshToken, profile, done) => {
        // Vérifiez si un utilisateur avec le même ID Google existe déjà dans MongoDB
        // Sinon, créez un nouvel utilisateur
        // Dans tous les cas, retournez l'utilisateur
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Application created by Valery-Jerome Michaux
// Copyrights can be viewed on Github
// https://github.com/Michaux-Technology/Geco-Kanban