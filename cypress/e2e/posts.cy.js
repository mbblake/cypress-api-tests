describe("/posts endpoint test suite", () => {
    before(() => {
        // Make sure no test users exist from a previous run
        cy.removeUserData();
        // Register the test user for a fresh access token. We'll use this same
        // token for the entire test run (it expires in an hour which is plenty of time)
        cy.fixture("user").then((user) => {
            cy.register(user);
        });
    });
    beforeEach(() => {
        cy.restorePostData();
        cy.fixture("../../db.json").as("data");
    });
    afterEach(cy.restorePostData);

    after(cy.removeUserData);

    describe("GET", () => {
        describe("GET /posts", () => {
            it("Should return JSON", function () {
                cy.request({
                    method: "GET",
                    url: "/posts",
                }).then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.headers).to.have.property(
                        "content-type",
                        "application/json; charset=utf-8"
                    );
                });
            });

            it("Should list all posts", function () {
                cy.request("GET", "/posts").then((res) => {
                    expect(res.body).to.have.length(5);
                    expect(res.body).to.deep.equal(this.data.posts);
                });
            });

            it("Should list posts using properties", function () {
                cy.request("GET", "/posts?id=2&id=4").then((res) => {
                    expect(res.body).to.have.length(2);
                    expect(res.body)
                        .to.deep.include(this.data.posts[1])
                        .to.deep.include(this.data.posts[3]);
                });
            });
        });

        describe("GET /posts/:id", () => {
            it("Should return JSON", () => {
                cy.request("GET", "/posts/1").then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.headers).to.have.property(
                        "content-type",
                        "application/json; charset=utf-8"
                    );
                });
            });

            it("Should list a single post", function () {
                cy.request("GET", "/posts/1").then((res) => {
                    expect(res.body).to.deep.equal(this.data.posts[0]);
                });
            });

            it("Should return an error for non-existent post", function () {
                cy.request({
                    method: "GET",
                    url: "/posts/100",
                    failOnStatusCode: false,
                }).then((res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body).to.deep.equal({});
                });
            });
        });
    });

    describe("POST", () => {
        describe("POST /posts", () => {
            it("Should return JSON", () => {
                cy.request("POST", "/posts", {
                    id: 100,
                    title: "Title of the 100th post",
                    author: "100th Author",
                }).then((res) => {
                    expect(res.status).to.equal(201);
                    expect(res.headers).to.have.property(
                        "content-type",
                        "application/json; charset=utf-8"
                    );
                });
            });

            it("Should create a new post", () => {
                cy.wrap({
                    id: 101,
                    title: "Title of the 101st post",
                    author: "101st Author",
                }).then((testPost) => {
                    cy.request("POST", "/posts", testPost).then((res) => {
                        expect(res.body).to.deep.equal(testPost);
                    });
                });
            });

            it("Should fail to create post if the id already exists", () => {
                cy.wrap({
                    id: 102,
                    title: "Title of the 102nd post",
                    author: "102nd Author",
                }).then((newPost) => {
                    cy.request("POST", "/posts", newPost);
                    cy.request({
                        method: "POST",
                        url: "/posts",
                        failOnStatusCode: false,
                        body: newPost,
                    }).then((res) => {
                        expect(res.status).to.equal(500);
                        expect(res.body).to.include(
                            "Error: Insert failed, duplicate id"
                        );
                    });
                });
            });
        });
    });

    describe("PUT", () => {
        describe("PUT /posts/:id", () => {
            it("Should return JSON", () => {
                cy.request("PUT", "/posts/1", {
                    id: 1,
                    title: "Title of the new updated 1st post",
                    author: "New Updated 1st Author",
                }).then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.headers).to.have.property(
                        "content-type",
                        "application/json; charset=utf-8"
                    );
                });
            });

            it("Should update a post", () => {
                cy.wrap({
                    id: 1,
                    title: "Title of the new updated 1st post",
                    author: "New Updated 1st Author",
                }).then((updatedPost) => {
                    cy.request("PUT", "/posts/1", updatedPost).then((res) => {
                        expect(res.body).to.deep.equal(updatedPost);
                    });
                });
            });

            it("Should fail to update post that does not exist", () => {
                cy.request({
                    method: "PUT",
                    url: "/posts/101",
                    failOnStatusCode: false,
                    body: {
                        id: 101,
                        title: "Title of the new updated 101st post",
                        author: "New Updated 101st Author",
                    },
                }).then((res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body).to.be.empty;
                });
            });
        });
    });

    describe("PATCH", () => {
        describe("PATCH /posts/:id", () => {
            it("Should return JSON", () => {
                cy.request("PATCH", "/posts/1", {
                    id: 1,
                    author: "New Updated 1st Author",
                }).then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.headers).to.have.property(
                        "content-type",
                        "application/json; charset=utf-8"
                    );
                });
            });

            it("Should partially update a post", () => {
                cy.request("PATCH", "/posts/1", {
                    id: 1,
                    author: "New Updated 1st Author",
                }).then((res) => {
                    expect(res.body).to.deep.equal({
                        id: 1,
                        title: "Title of the 1st post",
                        author: "New Updated 1st Author",
                    });
                });
            });

            it("Should fail to partially update post that does not exist", () => {
                cy.request({
                    method: "PATCH",
                    url: "/posts/101",
                    failOnStatusCode: false,
                    body: {
                        id: 101,
                        author: "New Updated 101st Author",
                    },
                }).then((res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body).to.be.empty;
                });
            });
        });
    });

    describe("DELETE", () => {
        describe("DELETE /posts/1", () => {
            it("Should return JSON", () => {
                cy.request("DELETE", "/posts/1").then((res) => {
                    expect(res.status).to.equal(200);
                    expect(res.headers).to.have.property(
                        "content-type",
                        "application/json; charset=utf-8"
                    );
                });
            });

            it("Should delete a post", () => {
                cy.request("DELETE", "/posts/1").then((res) => {
                    expect(res.body).to.be.empty;
                });
            });

            it("Should fail to delete post that does not exist", () => {
                cy.request({
                    method: "DELETE",
                    url: "/posts/100",
                    failOnStatusCode: false,
                }).then((res) => {
                    expect(res.status).to.equal(404);
                    expect(res.body).to.be.empty;
                });
            });
        });
    });
});
