import * as fs from 'fs/promises'
import * as path from 'node:path'

class Logger {
  constructor(private logPath: string) {
    this.logPath = logPath
  }

  public async log(body: any) {
    return await this.appendLog(this.logPath, body)
  }
  private async appendLog(logPath: string, body: any, name = 'log.txt') {
    try {
      await fs.access(logPath, fs.constants.F_OK)
    } catch {
      await fs.mkdir(logPath, { recursive: true })
    }
    const appendFile = path.join(logPath, name)
    return fs.appendFile(
      appendFile,
      new Date().toLocaleString() + ' ' + JSON.stringify(body) + '\n'
    )
  }
}

export default Logger
