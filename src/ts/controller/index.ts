import {
  IApplication,
  IFile,
  IPerson,
  ISession,
  ITarget,
  UserProvider,
  IDirectory,
} from '@/ts/core';
import { common } from '@/ts/base';
import { IWorkProvider } from '../core/work/provider';
import { IPageTemplate } from '../core/thing/standard/page';
import { IBoxProvider } from '../core/work/box';
import { AuthProvider } from '../core/auth';
/** 控制器基类 */
export class Controller extends common.Emitter {
  public currentKey: string;
  constructor(key: string) {
    super();
    this.currentKey = key;
  }
}
/**
 * 设置控制器
 */
class IndexController extends Controller {
  static _provider: UserProvider;
  constructor() {
    super('');
    if (IndexController._provider === undefined) {
      IndexController._provider = new UserProvider(this);
    }
  }
  /** 是否已登录 */
  get logined(): boolean {
    return this.provider.user != undefined;
  }
  /** 数据提供者 */
  get provider(): UserProvider {
    if (IndexController._provider === undefined) {
      IndexController._provider = new UserProvider(this);
    }
    return IndexController._provider;
  }
  /** 授权方法 */
  get auth(): AuthProvider {
    return this.provider.auth;
  }
  /** 当前用户 */
  get user(): IPerson {
    return this.provider.user!;
  }
  /** 办事提供者 */
  get work(): IWorkProvider {
    return this.provider.work!;
  }
  /** 暂存提供者 */
  get box(): IBoxProvider {
    return this.provider.box!;
  }
  /** 所有相关的用户 */
  get targets(): ITarget[] {
    return this.provider.targets;
  }
  /** 退出 */
  exit(): void {
    sessionStorage.clear();
    IndexController._provider = new UserProvider(this);
  }
  async loadApplications(): Promise<IApplication[]> {
    const apps: IApplication[] = [];
    for (const directory of this.targets
      .filter((i) => i.session.isMyChat)
      .map((a) => a.directory)) {
      apps.push(...(await directory.loadAllApplication()));
    }
    return apps;
  }
  /** 加载所有常用 */
  async loadCommons(): Promise<IFile[]> {
    const files: IFile[] = [];
    if (this.provider.user) {
      for (const item of this.provider.user.commons) {
        const target = this.provider.targets.find(
          (i) => i.id === item.targetId && i.spaceId === item.spaceId,
        );
        if (target) {
          const file = await target.directory.searchFile(
            item.directoryId,
            item.applicationId,
            item.id,
          );
          if (file) {
            files.push(file);
          }
        }
      }
    }
    return files;
  }

  /** 读取安心屋的配置文件 */
  async loadAxwConfigDir(belongId: string = '464368384847515648'): Promise<IDirectory[]> {
    const directorys: IDirectory[] = [];
    // 安心屋工作台配置标准
    for (const directory of this.targets
      // .filter((i) => i.session.isMyChat)
      // .filter((s) => s.belongId === belongId)
      .map((a) => a.directory)) {
      directorys.push(...(await directory.loadAllDirectorys()));
    }

    return directorys.filter(
      (i) => i.code === 'AXWCONFIG' && i.name === '安心屋工作台配置标准',
      // i.spaceId === belongId,
    );
  }

  /** 加载安心屋所有目录 */
  async loadAxwDirectorys(
    belongId: string = '464368384847515648',
  ): Promise<IDirectory[]> {
    const directorys: IDirectory[] = [];
    for (const directory of this.targets
      // .filter((i) => i.session.isMyChat)
      // 只要浙江省科学技术厅下的资源
      .filter((s) => s.spaceId === belongId)
      .map((a) => a.directory)) {
      directorys.push(...(await directory.loadAllDirectorys()));
    }
    return directorys;
  }

  /** 加载安心屋下的所有应用 */
  async loadAxwApplication(
    belongId: string = '464368384847515648',
  ): Promise<IApplication[]> {
    const applications: IApplication[] = [];
    for (const application of this.targets
      // .filter((i) => i.session.isMyChat)
      // 只要浙江省科学技术厅下的资源
      .filter((s) => s.belongId === belongId)
      .map((a) => a.directory)) {
      applications.push(...(await application.loadAllApplication()));
    }
    return applications;
  }

  /** 所有相关会话 */
  get chats(): ISession[] {
    const chats: ISession[] = [];
    if (this.provider.user) {
      chats.push(...this.provider.user.chats);
      for (const company of this.provider.user.companys) {
        chats.push(...company.chats);
      }
    }
    return chats;
  }

  /** 所有相关页面 */
  async loadPages(): Promise<IPageTemplate[]> {
    const pages: IPageTemplate[] = [];
    const result: IPageTemplate[] = [];
    for (const directory of this.targets.map((t) => t.directory)) {
      const templates = await directory.loadAllTemplate();
      pages.push(...templates.filter((item) => item.metadata.public));
    }
    if (pages.length > 0) {
      pages.forEach((c) => {
        const _page: any = c;
        _page.title = `${c.name}(${c.belong.name})`;
        if (
          !result.find(
            (s) => s.name === c.name && s.id === c.id && s.spaceId === c.spaceId,
          )
        ) {
          result.push(_page);
        }
      });
    }
    return result;
  }
}
export default new IndexController();
