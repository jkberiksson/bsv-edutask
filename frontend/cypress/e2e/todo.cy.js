describe('Using the Todo', () => {
    // Log a user in to get the userId
    let uid;
    let email;

    before(function () {
        // create a user from a fixture
        cy.fixture('user.json').then((user) => {
            return cy
                .request({
                    method: 'POST',
                    url: 'http://localhost:5000/users/create',
                    form: true,
                    body: user,
                })
                .then((response) => {
                    uid = response.body._id.$oid;
                    email = response.body.email;
                    // enter the main main page
                    cy.visit('http://localhost:3000');

                    // login to the system
                    cy.contains('div', 'Email Address').find('input[type=text]').type(email);
                    cy.get('form').submit();

                    // create a new task
                    cy.get('input[name="title"]').type('Hello World!');
                    cy.get('input[name="url"]').type('BQqzfHQkREo');
                    cy.get('input[type="submit"]').click();
                });
        });
    });

    beforeEach(function () {
        cy.visit('http://localhost:3000');
        // login to the system
        cy.contains('div', 'Email Address').find('input[type=text]').type(email);
        cy.get('form').submit();
    });

    it('task has a todo list', () => {
        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();
        cy.get('ul.todo-list').should('exist');
    });

    it('adds a new todo when clicking add with input', () => {
        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();
        cy.get('ul.todo-list').should('exist');

        // add a new todo item
        cy.get('ul.todo-list li')
            .last()
            .within(() => {
                cy.get('input[type="text"]').type('Test this todo');
                cy.get('input[type="submit"]').click();
            });
        // assert new todo item is added
        cy.get('ul.todo-list').contains('Test this todo').should('exist');
    });

    it('deletes a todo when clicking the delete button', () => {
        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();
        cy.get('ul.todo-list').should('exist');

        cy.intercept('DELETE', '**/todos/byid/*').as('deleteTodo');

        // delete the todo item
        cy.get('ul.todo-list li')
            .eq(-2) // select the second last item (the last one is the input field)
            .within(() => {
                cy.get('span.remover').should('be.visible').click();
            });

        // wait for the delete request to complete
        // assert that the request was successful
        cy.wait('@deleteTodo').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        // reload the page to ensure the todo list is updated
        // this is necessary because the todo list is not updated in real time
        // and the delete request is not reflected in the UI immediately
        cy.reload();

        cy.visit('http://localhost:3000');
        // login to the system
        cy.contains('div', 'Email Address').find('input[type=text]').type(email);
        cy.get('form').submit();

        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();

        // assert new todo item is deleted
        cy.get('ul.todo-list li').should('not.contain', 'Test this todo').and('have.length.lessThan', 3);
    });

    it('does not add a new todo when clicking add without input', () => {
        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();
        cy.get('ul.todo-list').should('exist');

        // click the add button without entering any text
        cy.get('ul.todo-list li')
            .last()
            .within(() => {
                cy.get('input[type="submit"]').click();
            });

        // reload the page to ensure the todo list is updated
        // this is necessary because the todo list is not updated in real time
        // and the request is not reflected in the UI immediately
        cy.reload();

        cy.visit('http://localhost:3000');
        // login to the system
        cy.contains('div', 'Email Address').find('input[type=text]').type(email);
        cy.get('form').submit();

        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();

        // assert new todo item is not added by checking the length of the list, how many items are in the list
        cy.get('ul.todo-list li', { timeout: 4000 }).should('exist').should('have.length.lessThan', 3);
    });

    it('gets marked as done when clicking the checkbox', () => {
        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();
        cy.get('ul.todo-list').should('exist');

        // check the checkbox
        cy.get('ul.todo-list li')
            .first()
            .within(() => {
                cy.get('span.checker').click();
            });

        // reload the page to ensure the todo list is updated
        // this is necessary because the todo list is not updated in real time
        // and the request is not reflected in the UI immediately
        cy.reload();

        cy.visit('http://localhost:3000');
        // login to the system
        cy.contains('div', 'Email Address').find('input[type=text]').type(email);
        cy.get('form').submit();

        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();

        // assert that the todo item is marked as done
        cy.get('ul.todo-list li')
            .first()
            .within(() => {
                cy.get('span.checker').should('have.class', 'checked');
                cy.get('span.editable').should('have.css', 'text-decoration-line', 'line-through');
            });
    });

    it('gets marker removed and text unstruck if a list item marked as done gets clicked', () => {
        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();
        cy.get('ul.todo-list').should('exist');

        // check the checkbox
        cy.get('ul.todo-list li')
            .first()
            .within(() => {
                cy.get('span.checker').click();
            });

        // reload the page to ensure the todo list is updated
        // this is necessary because the todo list is not updated in real time
        // and the request is not reflected in the UI immediately
        cy.reload();

        cy.visit('http://localhost:3000');
        // login to the system
        cy.contains('div', 'Email Address').find('input[type=text]').type(email);
        cy.get('form').submit();

        // click the task
        cy.contains('.title-overlay', 'Hello World!').click();

        // assert that the todo item is marked as undone
        cy.get('ul.todo-list li')
            .first()
            .within(() => {
                cy.get('span.checker').should('have.class', 'unchecked');
                cy.get('span.editable').should('not.have.css', 'text-decoration-line', 'line-through');
            });
    });

    after(() => {
        // Delete the user after the tests
        cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/users/${uid}`,
        });
    });
});
