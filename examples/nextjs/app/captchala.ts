import 'server-only'
import { CaptchaLaClient } from '@captcha-la/node'

// Reads CAPTCHALA_APP_KEY / CAPTCHALA_APP_SECRET from the environment.
export const captchala = new CaptchaLaClient()
