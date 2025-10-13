// Karma configuration for Jasmine + esbuild (JSX)
import { defineConfig } from 'karma'
import esbuild from 'karma-esbuild'
import jasmine from 'karma-jasmine'
import chrome from 'karma-chrome-launcher'

export default defineConfig({
  frameworks: ['jasmine'],
  files: [
    { pattern: 'tests/**/*.spec.js', watched: true }
  ],
  preprocessors: {
    'tests/**/*.spec.js': ['esbuild']
  },
  esbuild: {
    target: 'es2020',
    jsx: 'automatic', // React 17+ JSX transform
    loader: { '.js': 'jsx' }
  },
  reporters: ['progress'],
  browsers: ['ChromeHeadless'],
  singleRun: false,
  plugins: [esbuild, jasmine, chrome]
})
