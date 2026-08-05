import "dotenv/config";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/User.model.js";
import ClientProfile from "../models/ClientProfile.model.js";
import FreelancerProfile from "../models/FreelancerProfile.model.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const name = profile.displayName;
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        
        let user = await User.findOne({ googleId }).select("-password");

        if (user) {
          return done(null, user);
        }

        
        if (email) {
          user = await User.findOne({ email }).select("-password");

          if (user) {
           
            user.googleId = googleId;
            if (avatar && !user.avatar) {
              user.avatar = avatar;
            }
            user.isVerified = true;
            user.authProvider = "google";

            await user.save();

            return done(null, user);
          }
        }

        
        let role = req.query.state;

        
        if (role === "admin") {
          return done(new Error("Admin registration is not allowed via Google OAuth"), null);
        }

        if (!role || !["client", "freelancer"].includes(role)) {
          role = "freelancer";
        }

       
        user = await User.create({
          googleId,
          fullName: name,
          email,
          avatar,
          role,
          authProvider: "google",
          isVerified: true,
        });

        
        if (role === "client") {
          await ClientProfile.create({
            user: user._id,
          });
        } else if (role === "freelancer") {
          await FreelancerProfile.create({
            user: user._id,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user._id);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;