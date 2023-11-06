/**
 * Import the modules.
 * 
 * 导入模块.
 */
import { Plugin } from "obsidian";
import { SampleSettingTab } from "./setting-tab";

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
        this.addSettingTab(new SampleSettingTab(this.app, this));
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
    onunload() {
    }
}
