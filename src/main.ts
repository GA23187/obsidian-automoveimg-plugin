/**
 * Import the modules.
 *
 * 导入模块.
 */
import {
  App,
  Plugin,
  PluginManifest,
  TAbstractFile,
  TFile,
  Notice,
} from 'obsidian'
import { SampleSettingTab } from './setting-tab'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'

/**
 * The plugin.
 *
 * Make a default export for Obsidian to load the plugin.
 *
 * 插件.
 *
 * 进行默认导出以作为 Obsidian 加载插件的入口.
 */
export default class SamplePlugin extends Plugin {
  basePath: string
  moveFails: Array<string> = []
  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest)
    this.basePath = ''
    this.moveFails = []
  }
  /**
   * This method runs when the plugin is enabled or updated.
   *
   * This is where you will configure most of the capabilities of the plugin.
   *
   * 此方法在插件被激活或更新时触发.
   *
   * 这将是您设置插件大部分功能的地方.
   */
  onload() {
    /**
     * Register the plugin setting-tab.
     *
     * 注册插件设置页.
     */
    // this.addSettingTab(new SampleSettingTab(this.app, this))
    /**
     * 功能区（左侧的侧边栏）
     */
    // this.addRibbonIcon('dice', 'Print to console', () => {
    //   console.log('Hello, you!')
    // })
    console.log(this.app.vault.getRoot(), 'onload')
    this.basePath = this.app.vault.adapter.basePath
    console.log(this.basePath)
    this.registerEvent(
      this.app.vault.on('rename', async (file, oldPath) => {
        console.log(file, oldPath)
        console.log(
          'getResourcePath>>>',
          this.app.vault.getResourcePath(file as TFile)
        )
        if (file.extension === 'md') {
          await this.handleFileMove(file, oldPath)
        }
      })
    )
  }

  async handleFileMove(file: TAbstractFile, oldPath: string) {
    const content = await this.app.vault.read(file as TFile)
    console.log(content)
    //  ![xxx](images/xxxx.xxx) ![xxx](../images/xxxx.xxx)
    const regex = /!\[.*?\]\((.*?)\)/g
    // !\[.*?\]\(images\/([^\/]*\.[^\/]*)\) => ![](images/xx.xx)
    // 匹配字符串中的图片标记
    // const regex = /!\[.*?\]\(images\/([^\/]*\.[^\/]*)\)/g
    const matches = content.match(regex)
    if (matches) {
      // 判断将要移动的文件夹是否存在
      const oldStartPaths = oldPath.split('/').slice(0, -1)
      // B/A/A.md'.split('/').slice(0,-1) => B/A
      const newStartPaths = file.path.split('/').slice(0, -1)
      const newFolder = path.join(
        this.basePath,
        newStartPaths.join('/'),
        'images'
      )
      try {
        await fs.access(newFolder, fs.constants.F_OK)
      } catch {
        const notice = new Notice(`创建${newFolder}`, 1000)
        await fs.mkdir(newFolder)
      }
      const result = matches.map((match) => {
        // 提取括号中的图片路径
        const imgs = match.match(/\((.*?)\)/)
        console.log('括号中的图片路径>>>', imgs)
        if (imgs) {
          const imageName = imgs?.[1]
          // TODO: 只支持images/开头的 其他的../images暂不支持
          if (imageName.startsWith('images/')) {
            const moveOldPath = path.join(
              this.basePath,
              oldStartPaths.join('/'),
              imageName
            )
            const moveNewPath = path.join(
              this.basePath,
              newStartPaths.join('/'),
              imageName
            )
            console.log(moveOldPath, moveNewPath)
            this.moveImage(moveOldPath, moveNewPath)
          } else {
            console.log('暂不支持移动的images', imageName)
            const notice = new Notice(`暂不支持移动的${imageName}`, 3000)
            this.moveFails.push(imageName)
          }
        } else {
          console.error('提取括号中的图片路径失败')
        }
        return imgs?.[1]
      })
      console.log(result, 'imageName')
    }

    // TODO: obsidian内置会自动调整笔记中的images地址 此时我们又移动了images的实际地址?
    // 需要这里再将链接调整一次
    // await this.app.vault.modify(file, content);
  }

  async moveImage(oldPath: string, newPath: string) {
    // 使用适当的文件操作方法将图片从旧位置移动到新位置
    try {
      await fs.rename(oldPath, newPath)
      console.log(`Image moved from ${oldPath} to ${newPath}`)
    } catch (error) {
      // 通知
      const notice = new Notice(
        `Failed to move image from ${oldPath} to ${newPath}`,
        3000
      )
      this.moveFails.push(oldPath)
      console.error(`Failed to move image from ${oldPath} to ${newPath}`, error)
    }
  }
  /**
   * This method runs when the plugin is disabled.
   *
   * Any resources that the plugin is using must be released here to avoid affecting the performance of Obsidian after the plugin has been disabled.
   *
   * 此方法在插件被禁用时触发.
   *
   * 插件所调用的所有资源必须在这里得到释放, 以防止插件被禁用后对 Obsidian 的性能产生影响.
   */
  onunload() {}
}
