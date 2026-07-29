"use client";

import {
  createClient,
  type RealtimeChannel,
  type SupabaseClient,
} from "@supabase/supabase-js";
import {
  startTransition,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type FormEvent,
} from "react";

const SUPABASE_URL = "https://vtnoijwrdgabrvnnwedv.supabase.co";
const SUPABASE_KEY = "sb_publishable_SY72831668qPBSPE8Ts-sw_umcbwN3_";
const DEFAULT_DOCUMENT_ID = "overseas-report-2026-07-week4";
const LOCAL_REPORT_KEY = "overseas-report-2026-07-week4-local";
const COLLAB_CONFIG_KEY = "overseas-report-2026-07-week4-collab";

type ContentMap = Record<string, string>;

type Metrics = {
  juneExposure: number;
  julyExposure: number;
  juneUtm: number;
  julyUtm: number;
  juneWs: number;
  julyWs: number;
  officialJuneExposure: number;
  officialJulyExposure: number;
  officialJuneUtm: number;
  officialJulyUtm: number;
  smallJuneExposure: number;
  smallJulyExposure: number;
  officialWeek4Exposure: number;
  smallWeek4Exposure: number;
  officialWeek4Followers: number;
  smallWeek4Followers: number;
};

type Problem = {
  id: string;
  title: string;
  evidence: string;
  analysis: string;
  impact: string;
  solution: string;
  acceptance: string;
};

type Action = {
  id: string;
  title: string;
  detail: string;
  owner: string;
  deadline: string;
};

type SavedReport = {
  content?: ContentMap;
  metrics?: Metrics;
  problems?: Problem[];
  actions?: Action[];
};

const DEFAULT_CONTENT: ContentMap = {
  heroTitle: "海外账号数据汇报",
  heroSubtitle: "2026年7月｜全平台表现、INS Week4及转化链路分析",
  executive1:
    "7月累计曝光9300万，较6月下降27.04%；但官网UTM下降51.78%，导流损失明显大于流量损失。",
  executive2:
    "按曝光规模折算，UTM效率由每百万曝光136.6次降至90.2次，下降约33.9%，点击前承接是当前首要瓶颈。",
  executive3:
    "WS线索/UTM由约2.21%升至3.28%，说明进入链路后的线索质量没有恶化，增长重点应放在扩大有效点击。",
  executive4:
    "INS Week4官号贡献89.7%曝光，近期内容调整有效，但矩阵过度依赖单一账号，仍需提升小号起量和协同导流。",
  scopeNote:
    "AI分析口径：原文件提供的7月累计值、环比、INS月度及Week4数据。由环比反推的6月数值已在数据面板标注；未使用其他部门数据。",
  overallFinding:
    "三项指标都在下降，但UTM保留率只有48.22%，比曝光保留率低24.74个百分点。当前不是只要恢复播放量就能解决的问题，而是曝光后的主页访问、Bio链接和CTA承接效率不足。",
  efficiencyFinding:
    "流量到点击变弱、点击到线索变强，两者同时出现，说明应优先修复内容到主页、主页到链接的前半段链路，而不是盲目扩大泛曝光。",
  insFinding:
    "Week4官号单周曝光1182万，占7月官号曝光47.4%；官号回升明确，但小号只贡献10.3%曝光，矩阵抗波动能力偏弱。",
  histogramFinding:
    "6个可比指标的保留率分布两极化：2项落在40%—49%，2项落在60%—69%，2项落在70%—79%。样本仅6项，适合用于风险分层，不代表统计总体。",
  questions:
    "1. 7月数据统计截止日是否与6月一致？\n2. 能否补充主页访问、Link Sticker点击和Bio点击，定位UTM损失发生在哪一层？\n3. 哪类内容带来的WS线索质量最高？\n4. 小号低播主要来自内容重复、发布时间还是账号权重？",
  caveats:
    "若7月为截至7月29日的累计值，而6月为完整月份，则月环比存在周期不齐；正式汇报建议同时补充同天数对比或日均值。6月总体UTM、WS及部分INS数据由原文件环比反推，可能存在四舍五入误差。散点图和直方图仅使用本页可比指标，不用于因果判断。",
  source:
    "数据来源：用户提供的《明日汇报.html》。推导方法：上期值＝本期值÷（1＋环比）；效率指标按同口径曝光、UTM和WS计算。",
};

const DEFAULT_METRICS: Metrics = {
  juneExposure: 12746,
  julyExposure: 9300,
  juneUtm: 17406,
  julyUtm: 8393,
  juneWs: 385,
  julyWs: 275,
  officialJuneExposure: 4118,
  officialJulyExposure: 2493,
  officialJuneUtm: 12026,
  officialJulyUtm: 4927,
  smallJuneExposure: 1254,
  smallJulyExposure: 780,
  officialWeek4Exposure: 1182,
  smallWeek4Exposure: 136,
  officialWeek4Followers: 9926,
  smallWeek4Followers: 1911,
};

const DEFAULT_PROBLEMS: Problem[] = [
  {
    id: "conversion-gap",
    title: "曝光回升，但导流没有同步恢复",
    evidence:
      "全平台曝光下降27.04%，UTM下降51.78%；INS官号曝光下降39.46%，UTM下降59.03%。",
    analysis:
      "内容分发和初始推流已改善，但主页访问、Bio链接、Story承接、置顶评论CTA和私信转化动作没有同步增强。",
    impact:
      "流量即使继续回升，也可能停留在播放和涨粉层面，无法有效转化为官网访问与WS线索。",
    solution:
      "Story提高至每日3—5条并使用Link Sticker；视频文案、置顶评论和高意向回复统一强CTA；高播放视频12小时内完成Story二次转发和评论区导流。",
    acceptance:
      "UTM周环比连续两周回升；每百万曝光UTM由90.2提升至110以上；高播放视频二次导流执行率达到100%。",
  },
  {
    id: "account-concentration",
    title: "INS流量过度依赖官号",
    evidence:
      "Week4官号贡献89.7%曝光和83.9%涨粉，小号曝光贡献仅10.3%。",
    analysis:
      "小号内容模型、前三秒、发布时间及账号权重与官号存在差距，目前更多承担发布数量，而非稳定起量。",
    impact:
      "矩阵抗风险能力不足，官号一旦流量波动，INS整体曝光和涨粉会同步下滑。",
    solution:
      "拆解官号Week4高播放模板供小号复刻；小号执行70%验证内容＋30%新方向测试；按账号追踪单条均播、有效视频率和导流量。",
    acceptance:
      "小号周曝光贡献由10.3%提升至15%以上；连续两周至少跑出1—2条高于账号均值2倍的内容。",
  },
  {
    id: "click-quality",
    title: "有效点击不足，但线索质量仍有韧性",
    evidence:
      "UTM保留率48.22%，WS线索保留率71.43%；WS/UTM由约2.21%提升至3.28%。",
    analysis:
      "进入官网或WhatsApp的用户变少，但留下来的用户意向更集中，问题主要发生在点击之前，而不是线索质量明显恶化。",
    impact:
      "如果只追求泛流量，可能增加低意向曝光，却无法改善实际留资。",
    solution:
      "优先在高收藏、高评论的产品内容中放CTA；对高意向评论主动私信；按内容类型追踪UTM点击率和WS留资率。",
    acceptance:
      "WS/UTM不低于3%；高意向内容单独进入周报；UTM增长期间WS线索质量不显著下降。",
  },
  {
    id: "period-alignment",
    title: "月度比较可能存在周期不齐",
    evidence:
      "汇报日期为7月Week4，当前日期为7月29日；原文件未明确7月统计截止日是否与完整6月可比。",
    analysis:
      "如果7月是月内累计、6月是完整自然月，直接月环比会放大下降幅度。",
    impact:
      "管理层可能把统计周期差异误判为业务恶化，进而错误调整资源。",
    solution:
      "补充统计截止日；同时提供同天数对比、日均值和完整月预测；所有环比旁标注比较口径。",
    acceptance:
      "正式汇报页明确数据截止时间；月环比与同天数/日均对比同时展示，结论方向一致后再定性。",
  },
];

const DEFAULT_ACTIONS: Action[] = [
  {
    id: "funnel",
    title: "建立转化漏斗日报",
    detail: "逐层追踪曝光、主页访问、Bio/Story点击、UTM、私信和WS留资。",
    owner: "待填写",
    deadline: "本周",
  },
  {
    id: "cta",
    title: "统一高意向CTA",
    detail: "覆盖视频文案、置顶评论、Story Link Sticker和高意向评论回复。",
    owner: "待填写",
    deadline: "48小时",
  },
  {
    id: "replicate",
    title: "复刻官号有效内容",
    detail: "沉淀选题、前三秒、镜头、文案和发布时间模板，供小号验证。",
    owner: "待填写",
    deadline: "本周",
  },
  {
    id: "compare",
    title: "校准统计周期",
    detail: "补充7月截止日、同天数对比、日均值及完整月预测。",
    owner: "待填写",
    deadline: "汇报前",
  },
];

const METRIC_FIELDS: Array<{
  key: keyof Metrics;
  label: string;
  unit: string;
  derived?: boolean;
}> = [
  { key: "juneExposure", label: "6月全平台曝光", unit: "万" },
  { key: "julyExposure", label: "7月全平台曝光", unit: "万" },
  { key: "juneUtm", label: "6月官网UTM", unit: "次", derived: true },
  { key: "julyUtm", label: "7月官网UTM", unit: "次" },
  { key: "juneWs", label: "6月WS线索", unit: "条", derived: true },
  { key: "julyWs", label: "7月WS线索", unit: "条" },
  {
    key: "officialJuneExposure",
    label: "INS官号6月曝光",
    unit: "万",
    derived: true,
  },
  { key: "officialJulyExposure", label: "INS官号7月曝光", unit: "万" },
  {
    key: "officialJuneUtm",
    label: "INS官号6月UTM",
    unit: "次",
    derived: true,
  },
  { key: "officialJulyUtm", label: "INS官号7月UTM", unit: "次" },
  {
    key: "smallJuneExposure",
    label: "INS小号6月曝光",
    unit: "万",
    derived: true,
  },
  { key: "smallJulyExposure", label: "INS小号7月曝光", unit: "万" },
  {
    key: "officialWeek4Exposure",
    label: "官号Week4曝光",
    unit: "万",
  },
  { key: "smallWeek4Exposure", label: "小号Week4曝光", unit: "万" },
  {
    key: "officialWeek4Followers",
    label: "官号Week4涨粉",
    unit: "人",
  },
  {
    key: "smallWeek4Followers",
    label: "小号Week4涨粉",
    unit: "人",
  },
];

function retention(current: number, previous: number) {
  return previous ? (current / previous) * 100 : 0;
}

function change(current: number, previous: number) {
  return previous ? ((current - previous) / previous) * 100 : 0;
}

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits }).format(value);
}

function formatPercent(value: number, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

type EditableProps = {
  as?: ElementType;
  fieldKey: string;
  value: string;
  editing: boolean;
  className?: string;
  onCommit: (fieldKey: string, value: string) => void;
};

function Editable({
  as = "div",
  fieldKey,
  value,
  editing,
  className = "",
  onCommit,
}: EditableProps) {
  const ref = useRef<HTMLElement | null>(null);
  const Tag = as;

  useEffect(() => {
    if (
      ref.current &&
      document.activeElement !== ref.current &&
      ref.current.innerText !== value
    ) {
      ref.current.innerText = value;
    }
  }, [value]);

  return (
    <Tag
      ref={ref}
      className={`${className} editable-copy ${editing ? "is-editing" : ""}`}
      contentEditable={editing}
      suppressContentEditableWarning
      data-field-key={fieldKey}
      onBlur={(event: React.FocusEvent<HTMLElement>) => {
        const next = event.currentTarget.innerText.trim();
        if (next !== value) onCommit(fieldKey, next);
      }}
    >
      {value}
    </Tag>
  );
}

function TrendChart({
  exposure,
  utm,
  ws,
}: {
  exposure: number;
  utm: number;
  ws: number;
}) {
  const series = [
    { name: "曝光", value: exposure, color: "#2f5bff", dash: "" },
    { name: "UTM", value: utm, color: "#ec6b4f", dash: "" },
    { name: "WS线索", value: ws, color: "#1b9a72", dash: "7 6" },
  ];
  const y = (value: number) => 252 - value * 1.85;

  return (
    <svg
      className="chart-svg"
      viewBox="0 0 680 310"
      role="img"
      aria-label="6月到7月核心指标保留率折线图"
    >
      {[40, 60, 80, 100].map((tick) => (
        <g key={tick}>
          <line x1="72" x2="596" y1={y(tick)} y2={y(tick)} className="gridline" />
          <text x="58" y={y(tick) + 4} textAnchor="end" className="axis-label">
            {tick}%
          </text>
        </g>
      ))}
      <line x1="72" x2="596" y1={y(100)} y2={y(100)} className="baseline" />
      <text x="142" y="284" textAnchor="middle" className="axis-label strong">
        6月基准
      </text>
      <text x="522" y="284" textAnchor="middle" className="axis-label strong">
        7月当前
      </text>
      {series.map((item, index) => (
        <g key={item.name}>
          <path
            d={`M 142 ${y(100)} L 522 ${y(item.value)}`}
            fill="none"
            stroke={item.color}
            strokeWidth="4"
            strokeDasharray={item.dash}
          />
          <circle cx="142" cy={y(100)} r="6" fill="#fff" stroke={item.color} strokeWidth="3" />
          <circle cx="522" cy={y(item.value)} r="7" fill="#fff" stroke={item.color} strokeWidth="4" />
          <text
            x="544"
            y={y(item.value) + 5 + (index === 2 ? 10 : 0)}
            className="direct-label"
            fill={item.color}
          >
            {item.name} {formatPercent(item.value)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ScatterChart({
  points,
}: {
  points: Array<{ name: string; exposure: number; retention: number; color: string }>;
}) {
  const x = (value: number) => 86 + (value / 10000) * 490;
  const y = (value: number) => 248 - ((value - 35) / 45) * 178;

  return (
    <svg
      className="chart-svg"
      viewBox="0 0 680 310"
      role="img"
      aria-label="7月曝光规模与曝光保留率散点图"
    >
      {[40, 50, 60, 70, 80].map((tick) => (
        <g key={tick}>
          <line x1="76" x2="606" y1={y(tick)} y2={y(tick)} className="gridline" />
          <text x="62" y={y(tick) + 4} textAnchor="end" className="axis-label">
            {tick}%
          </text>
        </g>
      ))}
      {[0, 2500, 5000, 7500, 10000].map((tick) => (
        <text key={tick} x={x(tick)} y="282" textAnchor="middle" className="axis-label">
          {tick === 0 ? "0" : `${tick / 1000}k`}
        </text>
      ))}
      <text x="340" y="304" textAnchor="middle" className="axis-title">
        7月曝光（万）
      </text>
      <text x="18" y="160" textAnchor="middle" className="axis-title" transform="rotate(-90 18 160)">
        曝光保留率
      </text>
      {points.map((point) => (
        <g key={point.name}>
          <circle
            cx={x(point.exposure)}
            cy={y(point.retention)}
            r={point.name === "全平台" ? 14 : 11}
            fill={point.color}
            fillOpacity=".88"
            stroke="#fff"
            strokeWidth="4"
          />
          <text
            x={x(point.exposure) + 14}
            y={y(point.retention) - 14}
            className="direct-label"
            fill={point.color}
          >
            {point.name} {formatPercent(point.retention)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Heatmap({
  rows,
}: {
  rows: Array<{ name: string; values: Array<number | null> }>;
}) {
  const colorClass = (value: number | null) => {
    if (value === null) return "empty";
    if (value < 50) return "critical";
    if (value < 65) return "watch";
    return "steady";
  };

  return (
    <div className="heatmap" role="img" aria-label="各业务视角核心指标保留率热力图">
      <div className="heatmap-corner">业务视角</div>
      {["曝光", "UTM", "WS线索"].map((name) => (
        <div className="heatmap-head" key={name}>
          {name}
        </div>
      ))}
      {rows.map((row) => (
        <div className="heatmap-row" key={row.name}>
          <div className="heatmap-name">{row.name}</div>
          {row.values.map((value, index) => (
            <div className={`heatmap-cell ${colorClass(value)}`} key={`${row.name}-${index}`}>
              {value === null ? "待补充" : formatPercent(value)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function Histogram({ values }: { values: number[] }) {
  const bins = [
    { label: "40—49%", min: 40, max: 50 },
    { label: "50—59%", min: 50, max: 60 },
    { label: "60—69%", min: 60, max: 70 },
    { label: "70—79%", min: 70, max: 80 },
  ].map((bin) => ({
    ...bin,
    count: values.filter((value) => value >= bin.min && value < bin.max).length,
  }));
  const max = Math.max(...bins.map((bin) => bin.count), 1);

  return (
    <div className="histogram" role="img" aria-label="核心指标保留率直方图">
      <div className="histogram-plot">
        {bins.map((bin) => (
          <div className="histogram-bin" key={bin.label}>
            <div className="histogram-count">{bin.count}项</div>
            <div
              className="histogram-bar"
              style={{ height: `${Math.max((bin.count / max) * 150, 4)}px` }}
            />
            <div className="histogram-label">{bin.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [problems, setProblems] = useState(DEFAULT_PROBLEMS);
  const [actions, setActions] = useState(DEFAULT_ACTIONS);
  const [hydrated, setHydrated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [collabOpen, setCollabOpen] = useState(false);
  const [collabMode, setCollabMode] = useState<"create" | "join">("create");
  const [documentId, setDocumentId] = useState(DEFAULT_DOCUMENT_ID);
  const [displayName, setDisplayName] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [connectError, setConnectError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [online, setOnline] = useState(false);
  const [role, setRole] = useState("editor");
  const [onlinePeople, setOnlinePeople] = useState(1);
  const [syncText, setSyncText] = useState("本地自动保存");
  const clientRef = useRef<SupabaseClient | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const collaborationRef = useRef({
    connected: false,
    documentId: "",
    displayName: "",
    userId: "",
  });

  const exposureRetention = retention(metrics.julyExposure, metrics.juneExposure);
  const utmRetention = retention(metrics.julyUtm, metrics.juneUtm);
  const wsRetention = retention(metrics.julyWs, metrics.juneWs);
  const officialExposureRetention = retention(
    metrics.officialJulyExposure,
    metrics.officialJuneExposure,
  );
  const officialUtmRetention = retention(
    metrics.officialJulyUtm,
    metrics.officialJuneUtm,
  );
  const smallExposureRetention = retention(
    metrics.smallJulyExposure,
    metrics.smallJuneExposure,
  );
  const juneUtmPerMillion =
    metrics.juneExposure > 0 ? metrics.juneUtm / (metrics.juneExposure / 100) : 0;
  const julyUtmPerMillion =
    metrics.julyExposure > 0 ? metrics.julyUtm / (metrics.julyExposure / 100) : 0;
  const juneWsRate = metrics.juneUtm > 0 ? (metrics.juneWs / metrics.juneUtm) * 100 : 0;
  const julyWsRate = metrics.julyUtm > 0 ? (metrics.julyWs / metrics.julyUtm) * 100 : 0;
  const totalWeek4Exposure =
    metrics.officialWeek4Exposure + metrics.smallWeek4Exposure;
  const totalWeek4Followers =
    metrics.officialWeek4Followers + metrics.smallWeek4Followers;
  const officialExposureShare = totalWeek4Exposure
    ? (metrics.officialWeek4Exposure / totalWeek4Exposure) * 100
    : 0;
  const officialFollowerShare = totalWeek4Followers
    ? (metrics.officialWeek4Followers / totalWeek4Followers) * 100
    : 0;
  const retentionValues = [
    exposureRetention,
    utmRetention,
    wsRetention,
    officialExposureRetention,
    officialUtmRetention,
    smallExposureRetention,
  ];

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LOCAL_REPORT_KEY) || "{}") as SavedReport;
      if (saved.content) setContent({ ...DEFAULT_CONTENT, ...saved.content });
      if (saved.metrics) setMetrics({ ...DEFAULT_METRICS, ...saved.metrics });
      if (Array.isArray(saved.problems)) setProblems(saved.problems);
      if (Array.isArray(saved.actions)) setActions(saved.actions);
    } catch {
      // Keep the supplied report when local data is malformed.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      LOCAL_REPORT_KEY,
      JSON.stringify({ content, metrics, problems, actions }),
    );
  }, [hydrated, content, metrics, problems, actions]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const saved = JSON.parse(localStorage.getItem(COLLAB_CONFIG_KEY) || "{}") as {
        documentId?: string;
        displayName?: string;
      };
      if (saved.documentId) setDocumentId(saved.documentId);
      if (saved.displayName) setDisplayName(saved.displayName);
      if (saved.documentId && saved.displayName) {
        void resumeCollaboration(saved.documentId, saved.displayName);
      }
    } catch {
      // A first-time visitor starts in local mode.
    }
  }, [hydrated]);

  useEffect(() => {
    return () => {
      if (clientRef.current && channelRef.current) {
        void clientRef.current.removeChannel(channelRef.current);
      }
    };
  }, []);

  function snapshot(
    nextContent = content,
    nextMetrics = metrics,
    nextProblems = problems,
    nextActions = actions,
  ) {
    return { content: nextContent, metrics: nextMetrics, problems: nextProblems, actions: nextActions };
  }

  async function syncField(fieldKey: string, value: string) {
    if (!collaborationRef.current.connected || !clientRef.current) return;
    setSyncText("正在同步");
    const result = await clientRef.current.from("weekly_report_cells").upsert(
      {
        document_id: collaborationRef.current.documentId,
        field_key: fieldKey,
        value,
        updated_by_name: collaborationRef.current.displayName,
      },
      { onConflict: "document_id,field_key" },
    );
    setSyncText(result.error ? "同步失败，请重试" : "云端已保存");
  }

  function commitContent(fieldKey: string, value: string) {
    const next = { ...content, [fieldKey]: value };
    setContent(next);
    void syncField(`text:${fieldKey}`, value);
  }

  function commitProblems(next: Problem[]) {
    setProblems(next);
    void syncField("structure:problems", JSON.stringify(next));
  }

  function commitActions(next: Action[]) {
    setActions(next);
    void syncField("structure:actions", JSON.stringify(next));
  }

  function updateProblem(id: string, field: keyof Problem, value: string) {
    commitProblems(
      problems.map((problem) => (problem.id === id ? { ...problem, [field]: value } : problem)),
    );
  }

  function updateAction(id: string, field: keyof Action, value: string) {
    commitActions(
      actions.map((action) => (action.id === id ? { ...action, [field]: value } : action)),
    );
  }

  function addProblem() {
    setEditing(true);
    commitProblems([
      ...problems,
      {
        id: makeId("problem"),
        title: "点击填写新的问题",
        evidence: "填写数据表现或事实证据。",
        analysis: "填写AI分析或人工原因判断。",
        impact: "填写对业务目标的影响。",
        solution: "填写责任清晰、可执行的解决方案。",
        acceptance: "填写可量化的验收标准和时间。",
      },
    ]);
  }

  function addAction() {
    setEditing(true);
    commitActions([
      ...actions,
      {
        id: makeId("action"),
        title: "新增行动项",
        detail: "填写具体动作与交付物。",
        owner: "待填写",
        deadline: "待填写",
      },
    ]);
  }

  function saveMetrics() {
    void syncField("structure:metrics", JSON.stringify(metrics));
    setMetricsOpen(false);
    setSyncText(online ? "云端已保存" : "本地自动保存");
  }

  function applyRemoteField(fieldKey: string, value: string) {
    startTransition(() => {
      if (fieldKey.startsWith("text:")) {
        const key = fieldKey.slice(5);
        setContent((previous) => ({ ...previous, [key]: value }));
        return;
      }
      try {
        if (fieldKey === "structure:metrics") {
          setMetrics((previous) => ({ ...previous, ...(JSON.parse(value) as Metrics) }));
        } else if (fieldKey === "structure:problems") {
          setProblems(JSON.parse(value) as Problem[]);
        } else if (fieldKey === "structure:actions") {
          setActions(JSON.parse(value) as Action[]);
        }
      } catch {
        setSyncText("收到一条无法解析的远程修改");
      }
    });
  }

  async function uploadSnapshot(client: SupabaseClient, targetDocumentId: string) {
    const current = snapshot();
    const rows = [
      ...Object.entries(current.content).map(([key, value]) => ({
        document_id: targetDocumentId,
        field_key: `text:${key}`,
        value,
        updated_by_name: collaborationRef.current.displayName,
      })),
      {
        document_id: targetDocumentId,
        field_key: "structure:metrics",
        value: JSON.stringify(current.metrics),
        updated_by_name: collaborationRef.current.displayName,
      },
      {
        document_id: targetDocumentId,
        field_key: "structure:problems",
        value: JSON.stringify(current.problems),
        updated_by_name: collaborationRef.current.displayName,
      },
      {
        document_id: targetDocumentId,
        field_key: "structure:actions",
        value: JSON.stringify(current.actions),
        updated_by_name: collaborationRef.current.displayName,
      },
    ];
    for (let index = 0; index < rows.length; index += 100) {
      const result = await client
        .from("weekly_report_cells")
        .upsert(rows.slice(index, index + 100), { onConflict: "document_id,field_key" });
      if (result.error) throw result.error;
    }
  }

  async function loadCloudSnapshot(client: SupabaseClient, targetDocumentId: string) {
    const result = await client
      .from("weekly_report_cells")
      .select("field_key,value")
      .eq("document_id", targetDocumentId);
    if (result.error) throw result.error;
    (result.data || []).forEach((row) => applyRemoteField(row.field_key, row.value));
  }

  async function activateRealtime(
    client: SupabaseClient,
    targetDocumentId: string,
    userId: string,
    userName: string,
  ) {
    if (channelRef.current) await client.removeChannel(channelRef.current);
    const channel = client
      .channel(`overseas-report:${targetDocumentId}`, {
        config: { presence: { key: userId } },
      })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "weekly_report_cells",
          filter: `document_id=eq.${targetDocumentId}`,
        },
        (payload) => {
          const row = payload.new as {
            field_key?: string;
            value?: string;
            updated_by?: string;
          };
          if (
            row.field_key &&
            typeof row.value === "string" &&
            row.updated_by !== collaborationRef.current.userId
          ) {
            applyRemoteField(row.field_key, row.value);
            setSyncText("已收到远程修改");
          }
        },
      )
      .on("presence", { event: "sync" }, () => {
        setOnlinePeople(Math.max(Object.keys(channel.presenceState()).length, 1));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ name: userName, joinedAt: new Date().toISOString() });
          setOnline(true);
          setSyncText("云端已同步");
        }
      });
    channelRef.current = channel;
  }

  async function finishConnection(
    client: SupabaseClient,
    targetDocumentId: string,
    userName: string,
    userId: string,
  ) {
    collaborationRef.current = {
      connected: true,
      documentId: targetDocumentId,
      displayName: userName,
      userId,
    };
    clientRef.current = client;
    const roleResult = await client
      .from("weekly_report_members")
      .select("member_role")
      .eq("document_id", targetDocumentId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!roleResult.error && roleResult.data?.member_role) {
      setRole(roleResult.data.member_role);
    }
    await activateRealtime(client, targetDocumentId, userId, userName);
    localStorage.setItem(
      COLLAB_CONFIG_KEY,
      JSON.stringify({ documentId: targetDocumentId, displayName: userName }),
    );
  }

  async function resumeCollaboration(targetDocumentId: string, userName: string) {
    const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
    const sessionResult = await client.auth.getSession();
    const session = sessionResult.data.session;
    if (sessionResult.error || !session) return;
    const membership = await client
      .from("weekly_report_documents")
      .select("document_id")
      .eq("document_id", targetDocumentId)
      .maybeSingle();
    if (membership.error || !membership.data) return;
    await loadCloudSnapshot(client, targetDocumentId);
    await finishConnection(client, targetDocumentId, userName, session.user.id);
  }

  async function handleConnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConnectError("");
    setConnecting(true);
    try {
      if (accessCode.length < 6) throw new Error("访问码至少需要6位。");
      const targetDocumentId = documentId.trim();
      const userName = displayName.trim();
      if (!targetDocumentId || !userName) throw new Error("请填写文档编号和姓名。");
      const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
      });
      let sessionResult = await client.auth.getSession();
      let session = sessionResult.data.session;
      if (sessionResult.error) throw sessionResult.error;
      if (!session) {
        const signIn = await client.auth.signInAnonymously({
          options: { data: { display_name: userName } },
        });
        if (signIn.error || !signIn.data.session) {
          throw signIn.error || new Error("匿名登录失败。");
        }
        session = signIn.data.session;
      }
      const joinArgs = {
        p_document_id: targetDocumentId,
        p_access_code: accessCode,
        p_display_name: userName,
      };
      let newDocument = false;
      if (collabMode === "create") {
        const created = await client.rpc("create_weekly_report", {
          ...joinArgs,
          p_title: content.heroTitle,
        });
        if (created.error && /document_already_exists/i.test(created.error.message)) {
          const resumed = await client.rpc("join_weekly_report", joinArgs);
          if (resumed.error) throw resumed.error;
        } else if (created.error) {
          throw created.error;
        } else {
          newDocument = true;
        }
      } else {
        const joined = await client.rpc("join_weekly_report", joinArgs);
        if (joined.error) throw joined.error;
      }
      collaborationRef.current.displayName = userName;
      if (newDocument) {
        collaborationRef.current.documentId = targetDocumentId;
        await uploadSnapshot(client, targetDocumentId);
      } else {
        await loadCloudSnapshot(client, targetDocumentId);
      }
      await finishConnection(
        client,
        targetDocumentId,
        userName,
        session.user.id,
      );
      setCollabOpen(false);
      setAccessCode("");
    } catch (error) {
      const raw = error instanceof Error ? error.message : String(error);
      if (/access_code_invalid/i.test(raw)) {
        setConnectError("访问码不正确，请向发起者核对。");
      } else if (/document_not_found/i.test(raw)) {
        setConnectError("没有找到该共享汇报，请核对文档编号。");
      } else if (/anonymous/i.test(raw)) {
        setConnectError("匿名登录未开启，请检查Supabase身份验证设置。");
      } else {
        setConnectError(raw);
      }
    } finally {
      setConnecting(false);
    }
  }

  function downloadBackup() {
    const blob = new Blob([JSON.stringify(snapshot(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `海外账号数据汇报-备份-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const scatterPoints = [
    {
      name: "全平台",
      exposure: metrics.julyExposure,
      retention: exposureRetention,
      color: "#2f5bff",
    },
    {
      name: "INS官号",
      exposure: metrics.officialJulyExposure,
      retention: officialExposureRetention,
      color: "#ec6b4f",
    },
    {
      name: "INS小号",
      exposure: metrics.smallJulyExposure,
      retention: smallExposureRetention,
      color: "#1b9a72",
    },
  ];

  return (
    <main className="report-shell">
      <header className="hero">
        <div className="hero-grid" />
        <div className="hero-topline">
          <span>OVERSEAS SIGNAL / WEEK 4</span>
          <span>2026.07</span>
        </div>
        <Editable
          as="h1"
          fieldKey="heroTitle"
          value={content.heroTitle}
          editing={editing}
          onCommit={commitContent}
        />
        <Editable
          as="p"
          className="hero-subtitle"
          fieldKey="heroSubtitle"
          value={content.heroSubtitle}
          editing={editing}
          onCommit={commitContent}
        />
        <div className="hero-callout">
          <span className="ai-label">AI分析</span>
          <strong>关键矛盾已从“流量不足”转为“点击前转化效率不足”</strong>
          <p>
            UTM效率下降约33.9%，但WS/UTM提升约48.1%。先修复主页、链接和CTA承接，再扩大高意向曝光。
          </p>
        </div>
      </header>

      <div className="workbench" data-print-hide>
        <div className="workbench-status">
          <span className={`status-dot ${online ? "online" : ""}`} />
          <div>
            <strong>{online ? "多人在线协作" : "本地编辑模式"}</strong>
            <small>
              {syncText}
              {online ? ` · ${onlinePeople}人在线 · ${role === "owner" ? "发起者" : "成员"}` : ""}
            </small>
          </div>
        </div>
        <div className="workbench-actions">
          <button className={editing ? "active" : ""} onClick={() => setEditing(!editing)}>
            {editing ? "完成编辑" : "开启编辑"}
          </button>
          <button onClick={() => setMetricsOpen(true)}>编辑数据</button>
          <button onClick={addProblem}>新增问题</button>
          <button onClick={addAction}>新增行动</button>
          <button className="primary" onClick={() => setCollabOpen(true)}>
            {online ? "协作设置" : "连接在线协作"}
          </button>
          <button onClick={downloadBackup}>导出备份</button>
          <button onClick={() => window.print()}>打印 / PDF</button>
        </div>
      </div>

      <section className="section executive">
        <div className="section-index">00</div>
        <div className="section-heading">
          <div>
            <span className="kicker">EXECUTIVE SUMMARY</span>
            <h2>Executive Summary｜执行摘要</h2>
          </div>
          <span className="section-aside">先结论，后证据</span>
        </div>
        <div className="summary-grid">
          {[1, 2, 3, 4].map((number) => {
            const key = `executive${number}`;
            return (
              <article key={key}>
                <span className="summary-number">0{number}</span>
                <Editable
                  as="p"
                  fieldKey={key}
                  value={content[key]}
                  editing={editing}
                  onCommit={commitContent}
                />
              </article>
            );
          })}
        </div>
        <Editable
          as="p"
          className="scope-note"
          fieldKey="scopeNote"
          value={content.scopeNote}
          editing={editing}
          onCommit={commitContent}
        />
      </section>

      <section className="section">
        <div className="section-index">01</div>
        <div className="section-heading">
          <div>
            <span className="kicker">TOPLINE PERFORMANCE</span>
            <h2>整体下降中，UTM是最薄弱的一环</h2>
          </div>
          <span className="section-aside">6月基准＝100%</span>
        </div>
        <div className="kpi-grid">
          <article className="kpi-card blue">
            <span>7月全平台曝光</span>
            <strong>{formatNumber(metrics.julyExposure)}万</strong>
            <em>{formatPercent(change(metrics.julyExposure, metrics.juneExposure), 2)}</em>
            <small>保留率 {formatPercent(exposureRetention, 2)}</small>
          </article>
          <article className="kpi-card coral">
            <span>7月官网UTM</span>
            <strong>{formatNumber(metrics.julyUtm)}次</strong>
            <em>{formatPercent(change(metrics.julyUtm, metrics.juneUtm), 2)}</em>
            <small>保留率 {formatPercent(utmRetention, 2)}</small>
          </article>
          <article className="kpi-card mint">
            <span>7月WS线索</span>
            <strong>{formatNumber(metrics.julyWs)}条</strong>
            <em>{formatPercent(change(metrics.julyWs, metrics.juneWs), 2)}</em>
            <small>保留率 {formatPercent(wsRetention, 2)}</small>
          </article>
        </div>
        <div className="visual-grid">
          <article className="visual-card wide">
            <div className="visual-head">
              <div>
                <span className="chart-type">折线图</span>
                <h3>6月到7月核心指标保留率</h3>
                <p>同一指标内比较；6月设为100%，便于跨单位判断降幅。</p>
              </div>
            </div>
            <TrendChart exposure={exposureRetention} utm={utmRetention} ws={wsRetention} />
          </article>
          <article className="visual-card">
            <div className="visual-head">
              <div>
                <span className="chart-type">条形图</span>
                <h3>7月相对6月的保留水平</h3>
                <p>UTM保留率明显低于曝光与WS线索。</p>
              </div>
            </div>
            <div className="retention-bars">
              {[
                { name: "曝光", value: exposureRetention, color: "blue" },
                { name: "UTM", value: utmRetention, color: "coral" },
                { name: "WS线索", value: wsRetention, color: "mint" },
              ].map((item) => (
                <div className="retention-row" key={item.name}>
                  <span>{item.name}</span>
                  <div className="bar-track">
                    <i
                      className={item.color}
                      style={{ width: `${Math.min(item.value, 100)}%` }}
                    />
                  </div>
                  <strong>{formatPercent(item.value, 2)}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>
        <Editable
          as="p"
          className="finding"
          fieldKey="overallFinding"
          value={content.overallFinding}
          editing={editing}
          onCommit={commitContent}
        />
      </section>

      <section className="section split-section">
        <div className="section-index">02</div>
        <div className="section-heading">
          <div>
            <span className="kicker">CONVERSION DIAGNOSTICS</span>
            <h2>点击前效率下降，点击后留资率反而提升</h2>
          </div>
          <span className="section-aside">曝光 → UTM → WS</span>
        </div>
        <div className="efficiency-grid">
          <article className="efficiency-card">
            <span>每百万曝光UTM</span>
            <div>
              <strong>{formatNumber(juneUtmPerMillion, 1)}</strong>
              <b>→</b>
              <strong className="risk">{formatNumber(julyUtmPerMillion, 1)}</strong>
            </div>
            <small>效率变化 {formatPercent(change(julyUtmPerMillion, juneUtmPerMillion), 1)}</small>
          </article>
          <article className="efficiency-card">
            <span>WS线索 / UTM</span>
            <div>
              <strong>{formatPercent(juneWsRate, 2)}</strong>
              <b>→</b>
              <strong className="good">{formatPercent(julyWsRate, 2)}</strong>
            </div>
            <small>效率变化 +{formatPercent(change(julyWsRate, juneWsRate), 1)}</small>
          </article>
          <article className="efficiency-card narrative">
            <span>经营含义</span>
            <strong>优先修复点击前链路</strong>
            <small>主页访问、Bio链接、Story承接、置顶评论和主动私信。</small>
          </article>
        </div>
        <div className="visual-grid">
          <article className="visual-card wide">
            <div className="visual-head">
              <div>
                <span className="chart-type">热力图</span>
                <h3>业务视角 × 指标保留率</h3>
                <p>低于50%为优先修复，50%—64.9%需关注，65%以上相对稳定。</p>
              </div>
            </div>
            <Heatmap
              rows={[
                {
                  name: "全平台",
                  values: [exposureRetention, utmRetention, wsRetention],
                },
                {
                  name: "INS官号",
                  values: [officialExposureRetention, officialUtmRetention, null],
                },
                {
                  name: "INS小号",
                  values: [smallExposureRetention, null, null],
                },
              ]}
            />
          </article>
          <article className="visual-card">
            <div className="visual-head">
              <div>
                <span className="chart-type">诊断卡</span>
                <h3>转化损失定位</h3>
                <p>基于本页可验证数据，不推断未提供的主页访问层。</p>
              </div>
            </div>
            <div className="loss-stack">
              <div>
                <span>流量损失</span>
                <strong>{formatPercent(100 - exposureRetention, 1)}</strong>
              </div>
              <div className="risk">
                <span>UTM损失</span>
                <strong>{formatPercent(100 - utmRetention, 1)}</strong>
              </div>
              <div>
                <span>WS损失</span>
                <strong>{formatPercent(100 - wsRetention, 1)}</strong>
              </div>
            </div>
          </article>
        </div>
        <Editable
          as="p"
          className="finding"
          fieldKey="efficiencyFinding"
          value={content.efficiencyFinding}
          editing={editing}
          onCommit={commitContent}
        />
      </section>

      <section className="section">
        <div className="section-index">03</div>
        <div className="section-heading">
          <div>
            <span className="kicker">INS MATRIX</span>
            <h2>官号拉动Week4回暖，但矩阵集中度仍高</h2>
          </div>
          <span className="section-aside">官号 vs 小号</span>
        </div>
        <div className="account-grid">
          <article className="account-card official">
            <div className="account-name">
              <span>INS官号</span>
              <b>核心增长源</b>
            </div>
            <strong>{formatNumber(metrics.officialWeek4Exposure)}万</strong>
            <small>Week4曝光</small>
            <div className="account-metrics">
              <span>
                周涨粉 <b>{formatNumber(metrics.officialWeek4Followers)}</b>
              </span>
              <span>
                曝光贡献 <b>{formatPercent(officialExposureShare, 1)}</b>
              </span>
              <span>
                涨粉贡献 <b>{formatPercent(officialFollowerShare, 1)}</b>
              </span>
            </div>
          </article>
          <article className="account-card small-account">
            <div className="account-name">
              <span>INS小号</span>
              <b>协同提升区</b>
            </div>
            <strong>{formatNumber(metrics.smallWeek4Exposure)}万</strong>
            <small>Week4曝光</small>
            <div className="account-metrics">
              <span>
                周涨粉 <b>{formatNumber(metrics.smallWeek4Followers)}</b>
              </span>
              <span>
                曝光贡献 <b>{formatPercent(100 - officialExposureShare, 1)}</b>
              </span>
              <span>
                涨粉贡献 <b>{formatPercent(100 - officialFollowerShare, 1)}</b>
              </span>
            </div>
          </article>
        </div>
        <div className="visual-grid">
          <article className="visual-card wide">
            <div className="visual-head">
              <div>
                <span className="chart-type">散点图</span>
                <h3>7月曝光规模与曝光保留率</h3>
                <p>横轴为曝光规模，纵轴为7月相对6月的保留率；仅使用三组可比数据。</p>
              </div>
            </div>
            <ScatterChart points={scatterPoints} />
          </article>
          <article className="visual-card">
            <div className="visual-head">
              <div>
                <span className="chart-type">结构图</span>
                <h3>Week4矩阵贡献</h3>
                <p>合计曝光{formatNumber(totalWeek4Exposure)}万，涨粉{formatNumber(totalWeek4Followers)}。</p>
              </div>
            </div>
            <div className="share-ring" style={{ "--share": `${officialExposureShare * 3.6}deg` } as React.CSSProperties}>
              <div>
                <strong>{formatPercent(officialExposureShare, 1)}</strong>
                <span>官号曝光贡献</span>
              </div>
            </div>
            <div className="share-legend">
              <span><i className="official-dot" />官号</span>
              <span><i className="small-dot" />小号</span>
            </div>
          </article>
        </div>
        <Editable
          as="p"
          className="finding"
          fieldKey="insFinding"
          value={content.insFinding}
          editing={editing}
          onCommit={commitContent}
        />
      </section>

      <section className="section">
        <div className="section-index">04</div>
        <div className="section-heading">
          <div>
            <span className="kicker">DISTRIBUTION CHECK</span>
            <h2>风险集中在两项点击相关指标</h2>
          </div>
          <span className="section-aside">小样本，仅用于分层</span>
        </div>
        <div className="visual-grid histogram-layout">
          <article className="visual-card wide">
            <div className="visual-head">
              <div>
                <span className="chart-type">直方图</span>
                <h3>6项可比指标的保留率分布</h3>
                <p>包含全平台曝光/UTM/WS、官号曝光/UTM、小号曝光。</p>
              </div>
            </div>
            <Histogram values={retentionValues} />
          </article>
          <article className="visual-card">
            <div className="visual-head">
              <div>
                <span className="chart-type">数据清单</span>
                <h3>进入分布的指标</h3>
                <p>便于汇报时解释样本边界。</p>
              </div>
            </div>
            <div className="distribution-list">
              {[
                ["全平台曝光", exposureRetention],
                ["全平台UTM", utmRetention],
                ["全平台WS", wsRetention],
                ["官号曝光", officialExposureRetention],
                ["官号UTM", officialUtmRetention],
                ["小号曝光", smallExposureRetention],
              ].map(([name, value]) => (
                <div key={String(name)}>
                  <span>{name}</span>
                  <strong>{formatPercent(Number(value), 1)}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>
        <Editable
          as="p"
          className="finding"
          fieldKey="histogramFinding"
          value={content.histogramFinding}
          editing={editing}
          onCommit={commitContent}
        />
      </section>

      <section className="section diagnosis-section">
        <div className="section-index">05</div>
        <div className="section-heading">
          <div>
            <span className="kicker">DIAGNOSIS TO ACTION</span>
            <h2>存在问题与原因分析 → 解决方案与验收</h2>
          </div>
          <span className="section-aside">左右对应，可编辑、可增行</span>
        </div>
        <div className="column-labels">
          <span>左：AI分析 / 问题与原因</span>
          <span>右：解决方案 / 验收标准</span>
        </div>
        <div className="problem-list">
          {problems.map((problem, index) => (
            <article className="problem-row" key={problem.id}>
              <div className="problem-pane">
                <div className="pane-badge">AI分析 {String(index + 1).padStart(2, "0")}</div>
                <Editable
                  as="h3"
                  fieldKey={`${problem.id}:title`}
                  value={problem.title}
                  editing={editing}
                  onCommit={(_, value) => updateProblem(problem.id, "title", value)}
                />
                <div className="analysis-item">
                  <span>数据表现</span>
                  <Editable
                    as="p"
                    fieldKey={`${problem.id}:evidence`}
                    value={problem.evidence}
                    editing={editing}
                    onCommit={(_, value) => updateProblem(problem.id, "evidence", value)}
                  />
                </div>
                <div className="analysis-item">
                  <span>原因分析</span>
                  <Editable
                    as="p"
                    fieldKey={`${problem.id}:analysis`}
                    value={problem.analysis}
                    editing={editing}
                    onCommit={(_, value) => updateProblem(problem.id, "analysis", value)}
                  />
                </div>
                <div className="analysis-item">
                  <span>影响判断</span>
                  <Editable
                    as="p"
                    fieldKey={`${problem.id}:impact`}
                    value={problem.impact}
                    editing={editing}
                    onCommit={(_, value) => updateProblem(problem.id, "impact", value)}
                  />
                </div>
              </div>
              <div className="problem-arrow">→</div>
              <div className="solution-pane">
                <div className="pane-badge solution">解决与验收</div>
                <div className="solution-block">
                  <span>解决方案</span>
                  <Editable
                    as="p"
                    fieldKey={`${problem.id}:solution`}
                    value={problem.solution}
                    editing={editing}
                    onCommit={(_, value) => updateProblem(problem.id, "solution", value)}
                  />
                </div>
                <div className="acceptance-block">
                  <span>验收标准</span>
                  <Editable
                    as="p"
                    fieldKey={`${problem.id}:acceptance`}
                    value={problem.acceptance}
                    editing={editing}
                    onCommit={(_, value) => updateProblem(problem.id, "acceptance", value)}
                  />
                </div>
                {editing && (
                  <button
                    className="delete-button"
                    onClick={() => commitProblems(problems.filter((item) => item.id !== problem.id))}
                  >
                    删除本行
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
        <button className="add-row-button" data-print-hide onClick={addProblem}>
          ＋ 新增一组“问题—解决方案”
        </button>
      </section>

      <section className="section">
        <div className="section-index">06</div>
        <div className="section-heading">
          <div>
            <span className="kicker">NEXT ACTIONS</span>
            <h2>下一步行动与责任</h2>
          </div>
          <span className="section-aside">动作、负责人、期限</span>
        </div>
        <div className="action-grid">
          {actions.map((action, index) => (
            <article className="action-card" key={action.id}>
              <span className="action-number">{String(index + 1).padStart(2, "0")}</span>
              <Editable
                as="h3"
                fieldKey={`${action.id}:title`}
                value={action.title}
                editing={editing}
                onCommit={(_, value) => updateAction(action.id, "title", value)}
              />
              <Editable
                as="p"
                fieldKey={`${action.id}:detail`}
                value={action.detail}
                editing={editing}
                onCommit={(_, value) => updateAction(action.id, "detail", value)}
              />
              <div className="action-meta">
                <label>
                  负责人
                  <Editable
                    as="span"
                    fieldKey={`${action.id}:owner`}
                    value={action.owner}
                    editing={editing}
                    onCommit={(_, value) => updateAction(action.id, "owner", value)}
                  />
                </label>
                <label>
                  期限
                  <Editable
                    as="span"
                    fieldKey={`${action.id}:deadline`}
                    value={action.deadline}
                    editing={editing}
                    onCommit={(_, value) => updateAction(action.id, "deadline", value)}
                  />
                </label>
              </div>
              {editing && (
                <button
                  className="delete-button"
                  onClick={() => commitActions(actions.filter((item) => item.id !== action.id))}
                >
                  删除
                </button>
              )}
            </article>
          ))}
        </div>
        <button className="add-row-button" data-print-hide onClick={addAction}>
          ＋ 新增行动项
        </button>
      </section>

      <section className="section closing-grid">
        <div className="section-index">07</div>
        <article>
          <span className="kicker">FURTHER QUESTIONS</span>
          <h2>明天汇报后需要继续追问</h2>
          <Editable
            as="p"
            className="multiline-copy"
            fieldKey="questions"
            value={content.questions}
            editing={editing}
            onCommit={commitContent}
          />
        </article>
        <article>
          <span className="kicker caution">CAVEATS & ASSUMPTIONS</span>
          <h2>口径、假设与限制</h2>
          <Editable
            as="p"
            className="multiline-copy"
            fieldKey="caveats"
            value={content.caveats}
            editing={editing}
            onCommit={commitContent}
          />
        </article>
      </section>

      <footer>
        <Editable
          as="p"
          fieldKey="source"
          value={content.source}
          editing={editing}
          onCommit={commitContent}
        />
        <span>海外账号数据汇报 · 2026年7月 Week4</span>
      </footer>

      {metricsOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal metrics-modal" role="dialog" aria-modal="true" aria-labelledby="metrics-title">
            <div className="modal-head">
              <div>
                <span className="kicker">DATA CONTROL</span>
                <h2 id="metrics-title">编辑源数据</h2>
                <p>修改后指标卡和全部图表自动重算；标注“推导”的6月值来自原文件环比反推。</p>
              </div>
              <button onClick={() => setMetricsOpen(false)} aria-label="关闭数据面板">×</button>
            </div>
            <div className="metrics-form">
              {METRIC_FIELDS.map((field) => (
                <label key={field.key}>
                  <span>
                    {field.label}
                    {field.derived && <b>推导</b>}
                  </span>
                  <div>
                    <input
                      type="number"
                      value={metrics[field.key]}
                      onChange={(event) =>
                        setMetrics({
                          ...metrics,
                          [field.key]: Number(event.target.value),
                        })
                      }
                    />
                    <em>{field.unit}</em>
                  </div>
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button onClick={() => setMetrics(DEFAULT_METRICS)}>恢复本文件数据</button>
              <button className="primary" onClick={saveMetrics}>保存数据并同步</button>
            </div>
          </div>
        </div>
      )}

      {collabOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal collab-modal" onSubmit={handleConnect}>
            <div className="modal-head collab-head">
              <div>
                <span className="kicker">LIVE COLLABORATION</span>
                <h2>连接多人在线协作</h2>
                <p>同一文档编号和访问码的成员可实时修改；发起者再次连接不会覆盖已有内容。</p>
              </div>
              <button type="button" onClick={() => setCollabOpen(false)} aria-label="关闭协作设置">×</button>
            </div>
            <div className="collab-body">
              <div className="mode-tabs">
                <label className={collabMode === "create" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="mode"
                    checked={collabMode === "create"}
                    onChange={() => setCollabMode("create")}
                  />
                  创建 / 接入（发起者）
                </label>
                <label className={collabMode === "join" ? "selected" : ""}>
                  <input
                    type="radio"
                    name="mode"
                    checked={collabMode === "join"}
                    onChange={() => setCollabMode("join")}
                  />
                  加入共享汇报（成员）
                </label>
              </div>
              <label className="form-field">
                <span>共享文档编号</span>
                <input
                  value={documentId}
                  onChange={(event) => setDocumentId(event.target.value)}
                  required
                  maxLength={120}
                />
              </label>
              <label className="form-field">
                <span>你的姓名</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  required
                  maxLength={40}
                  placeholder="例如：张三"
                />
              </label>
              <label className="form-field">
                <span>协作访问码</span>
                <input
                  type="password"
                  value={accessCode}
                  onChange={(event) => setAccessCode(event.target.value)}
                  required
                  minLength={6}
                  maxLength={80}
                  placeholder="至少6位，由发起者设置或提供"
                />
                <small>访问码仅用于本次验证，不写入本地配置。</small>
              </label>
              <div className="configured-note">
                数据库连接已配置。首次由发起者创建；以后发起者仍可选左侧接入，系统会验证访问码后加载云端内容。
              </div>
              {connectError && <div className="form-error">{connectError}</div>}
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setCollabOpen(false)}>取消</button>
              <button className="primary" type="submit" disabled={connecting}>
                {connecting ? "正在连接…" : "连接并同步"}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
