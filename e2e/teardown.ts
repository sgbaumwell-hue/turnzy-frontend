import { generateScreenshotIndex } from './helpers/screenshotReport'

export default function globalTeardown() {
  generateScreenshotIndex()
}
