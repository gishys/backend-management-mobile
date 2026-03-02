/**
 * 统一 API 基础地址配置（与 config/api.json 一致）
 * 业务代码请从此文件或 api.json 读取，勿在别处硬编码 URL。
 */
import apiConfig from './api.json';

export const API_BASE_URL: string = apiConfig.API_BASE_URL;
