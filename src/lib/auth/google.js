import GoogleStrategy from "passport-google-oauth20";
import AuthorsModel from "../../api/authors/model.js";
import { createTokens } from "./tools.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BE_URL}/authors/auth/googleRedirect`,
  },
  async (_, __, profile, passportNext) => {
    console.log("Profile: ", profile);

    try {
      const { email, given_name, family_name } = profile._json;
      const author = await AuthorsModel.findOne({ email });

      if (author) {
        const tokens = await createTokens(author);
        passportNext(null, { tokens });
      } else {
        const newAuthor = new AuthorsModel({
          name: given_name,
          surname: family_name,
          avatar: "123",
          password: "12345",
          email,
          googleId: profile.id,
        });
        const createdAuthor = await newAuthor.save();

        const tokens = await createTokens(createdAuthor);
        console.log(tokens);
        passportNext(null, { tokens });
      }
    } catch (error) {
      passportNext(error);
    }
  }
);

export default googleStrategy;
