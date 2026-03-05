import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import { AntDesign, MaterialIcons, Fontisto } from '@expo/vector-icons';
import {
  AttachCatalogue,
  AttachFile,
} from '@/types/workflow/instance/processInstance.types';
import { API_BASE_URL } from '@/config/api';
import { Image } from 'expo-image';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type IImageInfo = { url: string };

// ============ 设计 Token ============
const TOKENS = {
  color: {
    primary: '#1677FF',
    primaryBg: '#E6F4FF',
    primaryText: '#1677FF',
    folder: '#FFA940',
    text: '#333',
    textSecondary: '#666',
    textTertiary: '#888',
    border: '#F0F0F0',
    bg: '#FFF',
    bgCard: '#FAFAFA',
    bgCardAlt: '#F8F8F8',
    overlay: 'rgba(0,0,0,0.9)',
    overlayBar: 'rgba(0,0,0,0.6)',
    white: '#FFF',
    icon: '#666',
    pdf: '#FF4444',
    docx: '#2196F3',
    xlsx: '#4CAF50',
    pptx: '#FF9800',
    img: '#9C27B0',
    default: '#666',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    indent: 12,
  },
  radius: {
    sm: 4,
    md: 6,
    lg: 8,
    pill: 20,
  },
  font: {
    name: 15,
    meta: 12,
    badge: 10,
    indicator: 16,
  },
} as const;

// 文件预览基础 URL 与 api client 统一使用 config/api
const getPreviewUrl = (path: string): string =>
  path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

/** 规范化文件类型：支持 MIME（如 image/jpeg、application/pdf）和空时从文件名取扩展名 */
const getNormalizedFileType = (fileType?: string, fileName?: string): string => {
  let raw = (fileType ?? '').trim().toLowerCase();
  if (raw.includes('/')) {
    raw = raw.split('/').pop() ?? '';
  }
  // 兼容 ".JPG" 这类带点扩展名，以及 "pdf; charset=utf-8" / "png?x=1" 这类附带参数的情况
  raw = raw.split(';')[0].split('?')[0].trim();
  while (raw.startsWith('.')) raw = raw.slice(1);
  if (!raw && fileName) {
    const ext = fileName.trim().split('.').pop()?.toLowerCase() ?? '';
    raw = ext;
  }
  return raw;
};

const isImageType = (type?: string, fileName?: string): boolean => {
  const normalized = getNormalizedFileType(type, fileName);
  return !!normalized && IMAGE_EXT.includes(normalized);
};
const isPdfType = (type?: string, fileName?: string): boolean => {
  const normalized = getNormalizedFileType(type, fileName);
  return !!normalized && normalized === 'pdf';
};

/** 用于展示的类型标签（扩展名大写），避免显示 MIME 如 image/jpeg */
const getDisplayFileType = (fileType?: string, fileName?: string): string =>
  getNormalizedFileType(fileType, fileName).toUpperCase() || '';

// ============ 工具函数 ============
const getFileColor = (type?: string, fileName?: string): string => {
  const normalized = getNormalizedFileType(type, fileName);
  const colors: Record<string, string> = {
    pdf: TOKENS.color.pdf,
    docx: TOKENS.color.docx,
    xlsx: TOKENS.color.xlsx,
    pptx: TOKENS.color.pptx,
    jpg: TOKENS.color.img,
    jpeg: TOKENS.color.img,
    png: TOKENS.color.img,
    gif: TOKENS.color.img,
    webp: TOKENS.color.img,
    bmp: TOKENS.color.img,
    default: TOKENS.color.default,
  };
  return normalized ? colors[normalized] ?? colors.default : colors.default;
};

const formatSize = (size?: number): string => {
  if (!size) return '0B';
  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
};

function isAttachCatalogue(obj: unknown): obj is AttachCatalogue {
  const o = obj as Record<string, unknown>;
  return (
    typeof o?.id === 'string' &&
    typeof o?.reference === 'string' &&
    typeof o?.referenceType === 'number' &&
    typeof o?.attachReceiveType === 'number' &&
    typeof o?.catalogueName === 'string' &&
    typeof o?.sequenceNumber === 'number' &&
    typeof o?.isStatic === 'boolean' &&
    typeof o?.creationTime === 'string' &&
    typeof o?.creatorId === 'string'
  );
}

// ============ 类型 ============
type TreeItemProps = {
  item: AttachCatalogue;
  level: number;
  onToggle: (id: string) => void;
  expandedIds: Set<string>;
  onFilePreview: (files: AttachFile[]) => void;
};

// ============ 树节点项 ============
const TreeItem: React.FC<TreeItemProps> = ({
  item,
  level,
  onToggle,
  expandedIds,
  onFilePreview,
}) => {
  const [rotateAnim] = useState(new Animated.Value(0));
  const isExpanded = expandedIds.has(item.id);
  const hasChildren = !!item.children?.length;
  const hasFiles = !!item.attachFiles?.length;
  // 仅作展示判断，不用于类型收窄（避免 item 在 else 分支被推成 never）
  const isFolder = isAttachCatalogue(item);
  const catalogue = item as AttachCatalogue;
  const indent = level * TOKENS.spacing.indent;
  const hitSlop = { top: 20, bottom: 20, left: 20, right: 20 };

  const runAnimation = () => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const mergedChildren = [
    ...(item.attachFiles?.map((file) => ({ type: 'file' as const, data: file })) ?? []),
    ...(item.children?.map((child) => ({ type: 'folder' as const, data: child })) ?? []),
  ];

  return (
    <View style={[styles.nodeContainer, { marginLeft: indent }]}>
      <View style={styles.nodeHeader}>
        {(hasChildren || hasFiles) && (
          <TouchableOpacity
            onPress={() => {
              onToggle(item.id);
              runAnimation();
            }}
            style={styles.caretButton}
            hitSlop={hitSlop}
          >
            <Animated.View
              style={{
                transform: [
                  {
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '90deg'],
                    }),
                  },
                ],
              }}
            >
              <AntDesign name="right" size={16} color={TOKENS.color.icon} />
            </Animated.View>
          </TouchableOpacity>
        )}

        <View style={styles.iconWrapper}>
          {isFolder ? (
            <AntDesign name="folder" size={20} color={TOKENS.color.folder} />
          ) : (
            <MaterialIcons
              name="insert-drive-file"
              size={20}
              color={getFileColor(catalogue.attachFiles?.[0]?.fileType, catalogue.attachFiles?.[0]?.fileName)}
            />
          )}
        </View>

        <View style={styles.contentArea}>
          <Text style={styles.name} numberOfLines={1}>
            {isFolder ? item.catalogueName : catalogue.attachFiles?.[0]?.fileName}
          </Text>
          {isFolder ? (
            <Text style={styles.meta}>
              {item.children?.length ?? 0} 个子目录 · {item.attachFiles?.length ?? 0} 个文件
            </Text>
          ) : (
            <View style={styles.fileMeta}>
              <Text style={styles.meta}>
                {formatSize(catalogue.attachFiles?.[0]?.fileSize)} · 下载{' '}
                {catalogue.attachFiles?.[0]?.downloadTimes ?? 0} 次
              </Text>
              {(() => {
                const first = catalogue.attachFiles?.[0];
                const displayType = getDisplayFileType(first?.fileType, first?.fileName);
                return displayType ? <Text style={styles.typeBadge}>{displayType}</Text> : null;
              })()}
            </View>
          )}
        </View>

        {isFolder ? (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onFilePreview(item.attachFiles ?? [])}
          >
            <Text style={styles.actionText}>查看</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.downloadBtn}
            onPress={() => catalogue.attachFiles?.[0] && onFilePreview([catalogue.attachFiles[0]])}
          >
            <Fontisto name="preview" size={20} color={TOKENS.color.white} />
          </TouchableOpacity>
        )}
      </View>

      {isExpanded && (hasChildren || hasFiles) && (
        <View style={styles.childrenArea}>
          <ScrollView
            style={styles.childrenScroll}
            contentContainerStyle={{ paddingBottom: TOKENS.spacing.sm }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {mergedChildren.map((child, index) => (
              <React.Fragment key={child.data.id}>
                {child.type === 'folder' ? (
                  <TreeItem
                    item={child.data as AttachCatalogue}
                    level={level + 1}
                    onToggle={onToggle}
                    expandedIds={expandedIds}
                    onFilePreview={onFilePreview}
                  />
                ) : (
                  <FileItem
                    file={child.data as AttachFile}
                    level={level + 1}
                    onFilePreview={onFilePreview}
                  />
                )}
                {index !== mergedChildren.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ============ 文件项 ============
const FileItem: React.FC<{
  file: AttachFile;
  level: number;
  onFilePreview: (files: AttachFile[]) => void;
}> = ({ file, level, onFilePreview }) => {
  const displayType = getDisplayFileType(file.fileType, file.fileName);
  return (
    <View style={[styles.fileContainer, { marginLeft: level * TOKENS.spacing.indent + 28 }]}>
      <MaterialIcons
        name="insert-drive-file"
        size={18}
        color={getFileColor(file.fileType, file.fileName)}
      />
      <View style={styles.fileContent}>
        <Text style={styles.fileName} numberOfLines={1}>
          {file.fileName}
        </Text>
        <View style={styles.fileMeta}>
          <Text style={styles.fileMetaText}>
            {formatSize(file.fileSize)} · 下载 {file.downloadTimes} 次
          </Text>
          {displayType ? <Text style={styles.typeBadge}>{displayType}</Text> : null}
        </View>
      </View>
      <TouchableOpacity
        style={styles.smallDownloadBtn}
        onPress={() => onFilePreview([file])}
      >
        <Fontisto name="preview" size={20} color={TOKENS.color.white} />
      </TouchableOpacity>
    </View>
  );
};

// ============ 应用内 PDF 查看（WebView）============
const PdfViewerModal: React.FC<{
  visible: boolean;
  pdfUrl: string | null;
  onClose: () => void;
  onOpenInBrowser?: (url: string) => void;
}> = ({ visible, pdfUrl, onClose, onOpenInBrowser }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.pdfViewerContainer}>
      <View style={styles.pdfViewerHeader}>
        <TouchableOpacity
          style={styles.pdfViewerCloseBtn}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <AntDesign name="close-circle" size={26} color={TOKENS.color.white} />
        </TouchableOpacity>
        {pdfUrl && onOpenInBrowser && (
          <TouchableOpacity
            style={styles.pdfViewerOpenExternal}
            onPress={() => onOpenInBrowser(pdfUrl)}
            activeOpacity={0.7}
          >
            <AntDesign name="export" size={18} color={TOKENS.color.white} />
            <Text style={styles.pdfViewerOpenExternalText}>在浏览器中打开</Text>
          </TouchableOpacity>
        )}
      </View>
      {pdfUrl ? (
        <WebView
          source={{
            // 公网 HTTPS 用 Google 在线预览（兼容性好）；内网/HTTP 用直链
            uri:
              pdfUrl.startsWith('https://')
                ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`
                : pdfUrl,
          }}
          style={styles.pdfWebView}
          originWhitelist={['*']}
          allowFileAccess
          scalesPageToFit
          startInLoadingState
          renderLoading={() => (
            <View style={styles.pdfLoadingWrap}>
              <ActivityIndicator size="large" color={TOKENS.color.primary} />
              <Text style={styles.pdfLoadingText}>加载 PDF…</Text>
            </View>
          )}
        />
      ) : null}
    </View>
  </Modal>
);

// ============ 预览模态：图片 + PDF + 其他文件 ============
type PreviewModalProps = {
  visible: boolean;
  onClose: () => void;
  imageList: IImageInfo[];
  pdfList: AttachFile[];
  otherFiles: AttachFile[];
  onOpenPdf: (file: AttachFile) => void;
  onOpenInBrowser: (file: AttachFile) => void;
  loadingPdf: boolean;
  screenWidth: number;
  screenHeight: number;
};

const PreviewModal: React.FC<PreviewModalProps> = ({
  visible,
  onClose,
  imageList,
  pdfList,
  otherFiles,
  onOpenPdf,
  onOpenInBrowser,
  loadingPdf,
  screenWidth,
  screenHeight,
}) => {
  const hasImages = imageList.length > 0;
  const hasPdfs = pdfList.length > 0;
  const hasOther = otherFiles.length > 0;
  const imageScrollRef = useRef<ScrollView>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const imagePageHeight = screenHeight - (Platform.OS === 'ios' ? 100 : 60);

  const onImageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / screenWidth);
    setImageIndex(index);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <AntDesign name="close-circle" size={28} color={TOKENS.color.white} />
        </TouchableOpacity>

        {hasImages && (
          <View key={imageList.map((i) => i.url).join('|')} style={styles.viewerContainer}>
            <ScrollView
              ref={imageScrollRef}
              horizontal
              pagingEnabled
              onMomentumScrollEnd={onImageScroll}
              showsHorizontalScrollIndicator={false}
              style={styles.imageScrollView}
            >
              {imageList.map((img, idx) => (
                <View key={idx} style={[styles.imagePage, { width: screenWidth, height: imagePageHeight }]}>
                  <Image
                    source={{ uri: img.url }}
                    style={[styles.previewImage, { width: screenWidth, height: imagePageHeight }]}
                    contentFit="contain"
                  />
                </View>
              ))}
            </ScrollView>
            {imageList.length > 1 && (
              <View style={styles.indicatorContainer}>
                <Text style={styles.indicatorText}>
                  {imageIndex + 1}/{imageList.length}
                </Text>
              </View>
            )}
          </View>
        )}

        {hasPdfs && (
          <View style={styles.pdfSection}>
            <Text style={styles.pdfSectionTitle}>PDF 文件</Text>
            <ScrollView
              style={styles.pdfList}
              contentContainerStyle={styles.pdfListContent}
              showsVerticalScrollIndicator={false}
            >
              {pdfList.map((file) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.pdfRow}
                  onPress={() => onOpenPdf(file)}
                  disabled={loadingPdf}
                >
                  <MaterialIcons
                    name="picture-as-pdf"
                    size={22}
                    color={TOKENS.color.pdf}
                  />
                  <Text style={styles.pdfFileName} numberOfLines={1}>
                    {file.fileName}
                  </Text>
                  {loadingPdf ? (
                    <ActivityIndicator size="small" color={TOKENS.color.primary} />
                  ) : (
                    <AntDesign name="export" size={18} color={TOKENS.color.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!hasImages && !hasPdfs && hasOther && (
          <View style={styles.otherFilesSection}>
            <Text style={styles.otherFilesTitle}>
              该格式暂不支持在线预览，可在浏览器中打开或下载
            </Text>
            <ScrollView
              style={styles.otherFilesList}
              contentContainerStyle={styles.otherFilesListContent}
              showsVerticalScrollIndicator={false}
            >
              {otherFiles.map((file) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.otherFileRow}
                  onPress={() => onOpenInBrowser(file)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="insert-drive-file"
                    size={22}
                    color={getFileColor(file.fileType, file.fileName)}
                  />
                  <Text style={styles.otherFileName} numberOfLines={1}>
                    {file.fileName}
                  </Text>
                  <AntDesign name="export" size={18} color={TOKENS.color.primary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {!hasImages && !hasPdfs && !hasOther && (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyPreviewText}>无可预览内容</Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

// ============ 主组件 ============
export const FileExplorer: React.FC<{ data: AttachCatalogue[] }> = ({ data }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState<IImageInfo[]>([]);
  const [previewPdfs, setPreviewPdfs] = useState<AttachFile[]>([]);
  const [previewOtherFiles, setPreviewOtherFiles] = useState<AttachFile[]>([]);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [pdfViewerVisible, setPdfViewerVisible] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFilePreview = (files: AttachFile[]) => {
    if (files.length === 0) return;
    const images: IImageInfo[] = [];
    const pdfs: AttachFile[] = [];
    const others: AttachFile[] = [];
    for (const f of files) {
      if (isImageType(f.fileType, f.fileName)) {
        images.push({ url: getPreviewUrl(f.filePath) });
      } else if (isPdfType(f.fileType, f.fileName)) {
        pdfs.push(f);
      } else {
        others.push(f);
      }
    }
    setPreviewImages(images);
    setPreviewPdfs(pdfs);
    setPreviewOtherFiles(others);
    // 延迟打开 Modal，确保图片/列表状态已提交后再显示，避免图片不显示、关闭时一闪
    setTimeout(() => setPreviewVisible(true), 80);
  };

  const handleOpenInBrowser = async (file: AttachFile) => {
    const url = getPreviewUrl(file.filePath);
    try {
      await WebBrowser.openBrowserAsync(url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    } catch (e) {
      Alert.alert('打开失败', '无法在浏览器中打开，请检查链接或网络。');
    }
  };

  const handleOpenPdf = (file: AttachFile) => {
    setCurrentPdfUrl(getPreviewUrl(file.filePath));
    setPdfViewerVisible(true);
  };

  return (
    <>
      <ScrollView style={styles.container} nestedScrollEnabled>
        {data.map((item) => (
          <TreeItem
            key={item.id}
            item={item}
            level={0}
            onToggle={handleToggle}
            expandedIds={expandedIds}
            onFilePreview={handleFilePreview}
          />
        ))}
      </ScrollView>

      <PreviewModal
        visible={previewVisible}
        onClose={() => {
          setPreviewVisible(false);
          // 延迟清空预览数据，避免关闭动画期间状态残留，解决关闭后需点击两次才能再打开
          setTimeout(() => {
            setPreviewImages([]);
            setPreviewPdfs([]);
            setPreviewOtherFiles([]);
          }, 300);
        }}
        imageList={previewImages}
        pdfList={previewPdfs}
        otherFiles={previewOtherFiles}
        onOpenPdf={handleOpenPdf}
        onOpenInBrowser={handleOpenInBrowser}
        loadingPdf={loadingPdf}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
      />

      <PdfViewerModal
        visible={pdfViewerVisible}
        pdfUrl={currentPdfUrl}
        onClose={() => {
          setPdfViewerVisible(false);
          setCurrentPdfUrl(null);
        }}
        onOpenInBrowser={async (url) => {
          try {
            await WebBrowser.openBrowserAsync(url, {
              presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
            });
          } catch (e) {
            Alert.alert('打开失败', '无法在浏览器中打开，请检查链接或网络。');
          }
        }}
      />
    </>
  );
};

// ============ 样式 ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.color.bg,
  },
  nodeContainer: {
    marginHorizontal: TOKENS.spacing.sm,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: TOKENS.spacing.md,
    backgroundColor: TOKENS.color.bgCard,
    borderRadius: TOKENS.radius.lg,
    marginVertical: 0,
  },
  caretButton: {
    padding: TOKENS.spacing.xs,
    marginRight: TOKENS.spacing.sm,
  },
  iconWrapper: {
    marginRight: TOKENS.spacing.md,
  },
  contentArea: {
    flex: 1,
    marginRight: TOKENS.spacing.md,
  },
  name: {
    fontSize: TOKENS.font.name,
    color: TOKENS.color.text,
    fontWeight: '500',
    marginBottom: 2,
  },
  meta: {
    fontSize: TOKENS.font.meta,
    color: TOKENS.color.textSecondary,
  },
  fileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOKENS.spacing.sm,
  },
  typeBadge: {
    backgroundColor: '#EEE',
    paddingHorizontal: 6,
    borderRadius: TOKENS.radius.sm,
    fontSize: TOKENS.font.badge,
    color: TOKENS.color.textSecondary,
    lineHeight: 18,
  },
  actionBtn: {
    paddingHorizontal: TOKENS.spacing.md,
    paddingVertical: 6,
    backgroundColor: TOKENS.color.primaryBg,
    borderRadius: TOKENS.radius.md,
  },
  actionText: {
    color: TOKENS.color.primaryText,
    fontSize: 13,
  },
  downloadBtn: {
    padding: 6,
    backgroundColor: TOKENS.color.primary,
    borderRadius: TOKENS.radius.md,
  },
  childrenArea: {
    marginTop: TOKENS.spacing.sm,
  },
  childrenScroll: {
    marginTop: TOKENS.spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: TOKENS.color.border,
    marginVertical: TOKENS.spacing.xs,
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: TOKENS.spacing.sm,
    paddingHorizontal: TOKENS.spacing.md,
    backgroundColor: TOKENS.color.bgCardAlt,
    borderRadius: TOKENS.radius.md,
    marginVertical: 2,
  },
  fileContent: {
    flex: 1,
    marginLeft: TOKENS.spacing.md,
    marginRight: TOKENS.spacing.sm,
  },
  fileName: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  fileMetaText: {
    fontSize: TOKENS.font.meta,
    color: TOKENS.color.textTertiary,
  },
  smallDownloadBtn: {
    padding: TOKENS.spacing.xs,
    backgroundColor: TOKENS.color.primary,
    borderRadius: TOKENS.radius.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: TOKENS.color.overlay,
  },
  pdfViewerContainer: {
    flex: 1,
    backgroundColor: TOKENS.color.overlay,
  },
  pdfViewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TOKENS.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 28,
    paddingBottom: TOKENS.spacing.sm,
  },
  pdfViewerCloseBtn: {
    padding: TOKENS.spacing.xs,
  },
  pdfViewerOpenExternal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pdfViewerOpenExternalText: {
    fontSize: 14,
    color: TOKENS.color.white,
  },
  pdfWebView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pdfLoadingWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: TOKENS.color.overlay,
  },
  pdfLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: TOKENS.color.white,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: TOKENS.spacing.xl,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  viewerContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
  },
  imageScrollView: {
    flex: 1,
  },
  imagePage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - (Platform.OS === 'ios' ? 100 : 60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT - (Platform.OS === 'ios' ? 100 : 60),
  },
  indicatorContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    alignSelf: 'center',
    backgroundColor: TOKENS.color.overlayBar,
    paddingHorizontal: TOKENS.spacing.md,
    paddingVertical: 6,
    borderRadius: TOKENS.radius.pill,
  },
  indicatorText: {
    color: TOKENS.color.white,
    fontSize: TOKENS.font.indicator,
    fontWeight: '500',
  },
  pdfSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 220,
    backgroundColor: TOKENS.color.overlay,
    borderTopLeftRadius: TOKENS.radius.lg,
    borderTopRightRadius: TOKENS.radius.lg,
    paddingTop: TOKENS.spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : TOKENS.spacing.lg,
  },
  pdfSectionTitle: {
    fontSize: TOKENS.font.name,
    color: TOKENS.color.white,
    fontWeight: '600',
    paddingHorizontal: TOKENS.spacing.lg,
    marginBottom: TOKENS.spacing.sm,
  },
  pdfList: {
    maxHeight: 160,
  },
  pdfListContent: {
    paddingHorizontal: TOKENS.spacing.lg,
    paddingBottom: TOKENS.spacing.sm,
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: TOKENS.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    gap: TOKENS.spacing.md,
  },
  pdfFileName: {
    flex: 1,
    fontSize: 14,
    color: TOKENS.color.white,
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPreviewText: {
    color: TOKENS.color.white,
    fontSize: 16,
  },
  otherFilesSection: {
    flex: 1,
    paddingHorizontal: TOKENS.spacing.xl,
    paddingTop: TOKENS.spacing.xl,
  },
  otherFilesTitle: {
    fontSize: 15,
    color: TOKENS.color.white,
    marginBottom: TOKENS.spacing.md,
    textAlign: 'center',
  },
  otherFilesList: {
    maxHeight: 300,
  },
  otherFilesListContent: {
    paddingBottom: TOKENS.spacing.lg,
  },
  otherFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: TOKENS.spacing.md,
    paddingHorizontal: TOKENS.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: TOKENS.radius.md,
    marginBottom: TOKENS.spacing.sm,
    gap: TOKENS.spacing.md,
  },
  otherFileName: {
    flex: 1,
    fontSize: 14,
    color: TOKENS.color.white,
  },
});
