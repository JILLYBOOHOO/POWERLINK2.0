# PowerLink

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.11.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Backend server

Run `npm run start:api` to start the local backend at `http://127.0.0.1:3001`.

## Start frontend + backend together

Run `npm run start:dev` to open two PowerShell windows:
- one for the backend API on `http://127.0.0.1:3001`
- one for the Angular frontend on `http://127.0.0.1:4200`

This is the recommended setup for this project on Windows because both processes stay alive in their own terminals.

Available endpoints include:
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/admin/login`
- `POST /api/orders`
- `GET /api/orders` (admin session)
- `POST /api/registrations`
- `GET /api/registrations` (admin session)

Default admin credentials:
- Email: `admin@powerlink.com`
- Password: `PowerLink123`

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
