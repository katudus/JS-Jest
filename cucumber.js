module.exports = {
  default: `--require features/step_definitions/**/*.js features/**/*.feature --format json:allure-results/cucumber.json`
}