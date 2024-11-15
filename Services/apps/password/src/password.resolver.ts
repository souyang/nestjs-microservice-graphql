import {Directive, Query, Resolver} from "@nestjs/graphql";

@Resolver(() => String)
export class PasswordResolver {
    constructor() {
    }

    // Used by docker to manage the health of the container
    @Query(() => String)
    @Directive("@shareable")
    healthCheck() {
        return "ok";
    }
}
