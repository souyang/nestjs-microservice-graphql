import { Injectable } from "@nestjs/common";
import { Role, User } from "@prisma/client";
import { PasswordService } from "../../password/src/password.service";
import { UserService } from "../../user/src/user.service";
import * as jwt from "jsonwebtoken";

const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[-!@#$%^&*?/;,=+_])(?=.{8,})/;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService
  ) {}

  private validateEmailFormat(email: string): void {
    if (!EMAIL_REGEX.test(email.toLowerCase())) {
      throw new Error("Invalid email format.");
    }
  }

  private validatePasswordFormat(password: string): void {
    if (!PASSWORD_REGEX.test(password)) {
      throw new Error(
        "Password must contain at least: 8 characters, 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol."
      );
    }
  }

  private ensureEnvVariable(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
  }

  async loginUser(
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<{ user: User; token: string }> {
    if (!email || !password || !confirmPassword) {
      throw new Error("All fields are required.");
    }

    this.validateEmailFormat(email);

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const user = await this.userService.getUserByEmail(email.toLowerCase());
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isCorrectPassword = await this.passwordService.comparePasswords(
      password,
      user.password
    );
    if (!isCorrectPassword) {
      throw new Error("Invalid email or password.");
    }

    const jwtSecret = this.ensureEnvVariable("JWT_SECRET");
    const token = jwt.sign(
      {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        description: user.description,
        email: user.email,
        role: user.role,
        imgProfile: user.imgProfile,
      },
      jwtSecret,
      { expiresIn: "1h" }
    );

    return { user, token };
  }

  async registerUser(
    lastname: string,
    firstname: string,
    email: string,
    password: string,
    confirmPassword: string,
    role: Role = "USER"
  ): Promise<User> {
    if (!lastname || !firstname || !email || !password || !confirmPassword) {
      throw new Error("All fields are required.");
    }

    this.validateEmailFormat(email);
    this.validatePasswordFormat(password);

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    const existingUser = await this.userService.getUserByEmail(email.toLowerCase());
    if (existingUser) {
      throw new Error("This email is already in use.");
    }

    const formattedLastname =
      lastname.charAt(0).toUpperCase() + lastname.slice(1).toLowerCase();
    const formattedFirstname =
      firstname.charAt(0).toUpperCase() + firstname.slice(1).toLowerCase();

    return this.userService.createUser(
      formattedLastname,
      formattedFirstname,
      email.toLowerCase(),
      password,
      role
    );
  }
}
