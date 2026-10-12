(function () {
  "use strict";

  const STORAGE_KEY = "calex-language-v1";
  const LANGUAGE_ORDER = ["en", "es", "fr", "de", "zh", "ja", "ko"];
  const LANGUAGES = {
    en: { label: "English", locale: "en-GB" },
    es: { label: "Español", locale: "es-ES" },
    fr: { label: "Français", locale: "fr-FR" },
    de: { label: "Deutsch", locale: "de-DE" },
    zh: { label: "中文", locale: "zh-CN" },
    ja: { label: "日本語", locale: "ja-JP" },
    ko: { label: "한국어", locale: "ko-KR" },
  };

  // Locally bundled phrase translations for Chinese, Japanese, and Korean.
  // No interface text is sent to a translation service.
  const ASIAN_TRANSLATIONS = {
  "Skip to calendar": [
    "跳转到日历",
    "カレンダーに移動",
    "캘린더로 이동"
  ],
  "YOUR TIME, WELL SPENT": [
    "善用你的时间",
    "時間を有効に",
    "시간을 알차게"
  ],
  "Your day, at a glance": [
    "一览你的一天",
    "今日の予定をひと目で",
    "한눈에 보는 하루"
  ],
  "On this device": [
    "在此设备上",
    "このデバイス上",
    "이 기기에서"
  ],
  "Ask assistant": [
    "询问助手",
    "アシスタントに質問",
    "어시스턴트에게 질문"
  ],
  "New event": [
    "新建事件",
    "新しい予定",
    "새 일정"
  ],
  "MAKE ROOM FOR WHAT MATTERS": [
    "为重要的事留出时间",
    "大切なことのために時間を",
    "중요한 일에 시간을"
  ],
  "Monday": [
    "星期一",
    "月曜日",
    "월요일"
  ],
  "Quick add": [
    "快速添加",
    "クイック追加",
    "빠른 추가"
  ],
  "Today": [
    "今天",
    "今日",
    "오늘"
  ],
  "Tomorrow": [
    "明天",
    "明日",
    "내일"
  ],
  "Coming up": [
    "即将到来",
    "近日の予定",
    "다가오는 일정"
  ],
  "Mon": [
    "周一",
    "月",
    "월"
  ],
  "Tue": [
    "周二",
    "火",
    "화"
  ],
  "Wed": [
    "周三",
    "水",
    "수"
  ],
  "Thu": [
    "周四",
    "木",
    "목"
  ],
  "Fri": [
    "周五",
    "金",
    "금"
  ],
  "Sat": [
    "周六",
    "土",
    "토"
  ],
  "Sun": [
    "周日",
    "日",
    "일"
  ],
  "Selected day": [
    "所选日期",
    "選択した日",
    "선택한 날짜"
  ],
  "Quick event": [
    "快速事件",
    "クイック予定",
    "빠른 일정"
  ],
  "Add event": [
    "添加事件",
    "予定を追加",
    "일정 추가"
  ],
  "LOOKING AHEAD": [
    "提前规划",
    "これからの予定",
    "미리 보기"
  ],
  "Your next 30 days": [
    "未来30天",
    "今後30日間",
    "앞으로 30일"
  ],
  "A little perspective for everything on your calendar.": [
    "一览日历中的所有安排。",
    "カレンダーの予定を見渡しましょう。",
    "캘린더의 모든 일정을 한눈에 확인하세요."
  ],
  "Back to today": [
    "返回今天",
    "今日に戻る",
    "오늘로 돌아가기"
  ],
  "Settings": [
    "设置",
    "設定",
    "설정"
  ],
  "Your Calex account": [
    "你的 Calex 账户",
    "Calex アカウント",
    "Calex 계정"
  ],
  "Sign in or create an account to securely sync your calendar across devices.": [
    "登录或创建账户，以便在不同设备间安全同步日历。",
    "サインインまたはアカウントを作成して、デバイス間でカレンダーを安全に同期します。",
    "로그인하거나 계정을 만들어 여러 기기에서 캘린더를 안전하게 동기화하세요."
  ],
  "Not signed in · using this device": [
    "未登录 · 正在使用此设备",
    "未サインイン · このデバイスを使用中",
    "로그아웃 상태 · 이 기기 사용 중"
  ],
  "Open live Calex to sign in": [
    "打开 Calex 网站以登录",
    "Calex のウェブサイトを開いてサインイン",
    "로그인하려면 Calex 웹사이트 열기"
  ],
  "Continue with Google": [
    "使用 Google 继续",
    "Google で続行",
    "Google로 계속"
  ],
  "Email": [
    "电子邮件",
    "メールアドレス",
    "이메일"
  ],
  "Password": [
    "密码",
    "パスワード",
    "비밀번호"
  ],
  "Sign in": [
    "登录",
    "サインイン",
    "로그인"
  ],
  "Create account": [
    "创建账户",
    "アカウントを作成",
    "계정 만들기"
  ],
  "Forgot password?": [
    "忘记密码？",
    "パスワードをお忘れですか？",
    "비밀번호를 잊으셨나요?"
  ],
  "Resend confirmation email": [
    "重新发送确认邮件",
    "確認メールを再送信",
    "확인 이메일 다시 보내기"
  ],
  "Sign out": [
    "退出登录",
    "サインアウト",
    "로그아웃"
  ],
  "New password": [
    "新密码",
    "新しいパスワード",
    "새 비밀번호"
  ],
  "Confirm password": [
    "确认密码",
    "パスワードを確認",
    "비밀번호 확인"
  ],
  "Set password": [
    "设置密码",
    "パスワードを設定",
    "비밀번호 설정"
  ],
  "CALEX PREFERENCES": [
    "CALEX 偏好设置",
    "CALEX の設定",
    "CALEX 환경설정"
  ],
  "Make Calex work the way you do.": [
    "按你的习惯使用 Calex。",
    "自分に合った Calex にしましょう。",
    "내 방식에 맞게 Calex를 설정하세요."
  ],
  "Your profile": [
    "个人资料",
    "プロフィール",
    "프로필"
  ],
  "Your name": [
    "你的姓名",
    "名前",
    "이름"
  ],
  "Add your location": [
    "添加所在地",
    "場所を追加",
    "위치 추가"
  ],
  "Edit profile details": [
    "编辑个人资料",
    "プロフィールを編集",
    "프로필 정보 수정"
  ],
  "Display name": [
    "显示名称",
    "表示名",
    "표시 이름"
  ],
  "Location": [
    "位置",
    "場所",
    "위치"
  ],
  "City or region": [
    "城市或地区",
    "都市または地域",
    "도시 또는 지역"
  ],
  "Save profile": [
    "保存个人资料",
    "プロフィールを保存",
    "프로필 저장"
  ],
  "Account & sync": [
    "账户与同步",
    "アカウントと同期",
    "계정 및 동기화"
  ],
  "Preferences": [
    "偏好设置",
    "環境設定",
    "환경설정"
  ],
  "Time zone": [
    "时区",
    "タイムゾーン",
    "시간대"
  ],
  "Automatic · device time zone": [
    "自动 · 设备时区",
    "自動 · デバイスのタイムゾーン",
    "자동 · 기기 시간대"
  ],
  "Automatic": [
    "自动",
    "自動",
    "자동"
  ],
  "Choose time zone": [
    "选择时区",
    "タイムゾーンを選択",
    "시간대 선택"
  ],
  "Search by city or region": [
    "按城市或地区搜索",
    "都市または地域で検索",
    "도시 또는 지역 검색"
  ],
  "Matching time zones": [
    "匹配的时区",
    "一致するタイムゾーン",
    "일치하는 시간대"
  ],
  "Time zone mode": [
    "时区模式",
    "タイムゾーン設定",
    "시간대 모드"
  ],
  "Automatic mode follows the time zone configured on this device.": [
    "自动模式会使用此设备设置的时区。",
    "自動モードでは、このデバイスに設定されたタイムゾーンを使用します。",
    "자동 모드는 이 기기에 설정된 시간대를 따릅니다."
  ],
  "Save time zone": [
    "保存时区",
    "タイムゾーンを保存",
    "시간대 저장"
  ],
  "Dark appearance": [
    "深色外观",
    "ダーク表示",
    "어두운 화면"
  ],
  "Adjust the interface for low-light environments": [
    "调整界面以适应低光环境",
    "暗い場所に合わせて画面を調整します",
    "어두운 환경에 맞게 화면을 조정합니다"
  ],
  "Language": [
    "语言",
    "言語",
    "언어"
  ],
  "Choose your language": [
    "选择语言",
    "言語を選択",
    "언어 선택"
  ],
  "Display language": [
    "显示语言",
    "表示言語",
    "표시 언어"
  ],
  "Your interface language is saved with your preferences.": [
    "界面语言会与偏好设置一起保存。",
    "表示言語は設定とともに保存されます。",
    "인터페이스 언어는 환경설정과 함께 저장됩니다."
  ],
  "Auto · System settings": [
    "自动 · 系统设置",
    "自動 · システム設定",
    "자동 · 시스템 설정"
  ],
  "System language": [
    "系统语言",
    "システム言語",
    "시스템 언어"
  ],
  "Search languages": [
    "搜索语言",
    "言語を検索",
    "언어 검색"
  ],
  "No matching languages.": [
    "没有匹配的语言。",
    "一致する言語がありません。",
    "일치하는 언어가 없습니다."
  ],
  "Using": [
    "正在使用",
    "使用中",
    "사용 중"
  ],
  "on": [
    "开启",
    "オン",
    "켜짐"
  ],
  "off": [
    "关闭",
    "オフ",
    "꺼짐"
  ],
  "Your data": [
    "你的数据",
    "データ",
    "데이터"
  ],
  "Export calendar": [
    "导出日历",
    "カレンダーをエクスポート",
    "캘린더 내보내기"
  ],
  "Download a portable .ics calendar file": [
    "下载可移植的 .ics 日历文件",
    "持ち運び可能な .ics カレンダーファイルをダウンロード",
    "이동 가능한 .ics 캘린더 파일 다운로드"
  ],
  "Import calendar": [
    "导入日历",
    "カレンダーをインポート",
    "캘린더 가져오기"
  ],
  "About & legal": [
    "关于与法律信息",
    "情報と法的事項",
    "정보 및 법적 고지"
  ],
  "About Calex": [
    "关于 Calex",
    "Calex について",
    "Calex 정보"
  ],
  "What Calex does and how to get help": [
    "Calex 的功能及获取帮助的方式",
    "Calex の機能とヘルプの利用方法",
    "Calex 기능 및 도움말"
  ],
  "Overview": [
    "概览",
    "概要",
    "개요"
  ],
  "Calendar": [
    "日历",
    "カレンダー",
    "캘린더"
  ],
  "Agenda": [
    "日程",
    "予定一覧",
    "일정"
  ],
  "MY CALENDARS": [
    "我的日历",
    "マイカレンダー",
    "내 캘린더"
  ],
  "Personal": [
    "个人",
    "個人",
    "개인"
  ],
  "Work & study": [
    "工作与学习",
    "仕事と学習",
    "업무 및 학습"
  ],
  "Wellbeing": [
    "身心健康",
    "ウェルビーイング",
    "웰빙"
  ],
  "Install Calex": [
    "安装 Calex",
    "Calex をインストール",
    "Calex 설치"
  ],
  "Saved on this device": [
    "已保存在此设备",
    "このデバイスに保存済み",
    "이 기기에 저장됨"
  ],
  "Describe your event": [
    "描述你的事件",
    "予定を入力",
    "일정 설명"
  ],
  "Start typing to see the preview...": [
    "开始输入以查看预览…",
    "入力するとプレビューが表示されます…",
    "입력을 시작하면 미리보기가 표시됩니다…"
  ],
  "Date *": [
    "日期 *",
    "日付 *",
    "날짜 *"
  ],
  "Start time": [
    "开始时间",
    "開始時刻",
    "시작 시간"
  ],
  "End time": [
    "结束时间",
    "終了時刻",
    "종료 시간"
  ],
  "Repeat": [
    "重复",
    "繰り返し",
    "반복"
  ],
  "Never": [
    "从不",
    "なし",
    "안 함"
  ],
  "Every day": [
    "每天",
    "毎日",
    "매일"
  ],
  "Every week": [
    "每周",
    "毎週",
    "매주"
  ],
  "Every fortnight": [
    "每两周",
    "隔週",
    "격주"
  ],
  "Every month": [
    "每月",
    "毎月",
    "매월"
  ],
  "Every year": [
    "每年",
    "毎年",
    "매년"
  ],
  "People": [
    "人员",
    "参加者",
    "참여자"
  ],
  "Notes": [
    "备注",
    "メモ",
    "메모"
  ],
  "Save event": [
    "保存事件",
    "予定を保存",
    "일정 저장"
  ],
  "Calex assistant": [
    "Calex 助手",
    "Calex アシスタント",
    "Calex 어시스턴트"
  ],
  "Plan my day": [
    "规划我的一天",
    "今日の予定を立てる",
    "하루 계획 세우기"
  ],
  "Find focus time": [
    "寻找专注时间",
    "集中できる時間を探す",
    "집중 시간 찾기"
  ],
  "Create an event": [
    "创建事件",
    "予定を作成",
    "일정 만들기"
  ],
  "Message the assistant": [
    "给助手发消息",
    "アシスタントにメッセージ",
    "어시스턴트에게 메시지"
  ],
  "Search calendar": [
    "搜索日历",
    "カレンダーを検索",
    "캘린더 검색"
  ],
  "Go to today": [
    "转到今天",
    "今日へ移動",
    "오늘로 이동"
  ],
  "Month / week / year": [
    "月 / 周 / 年",
    "月 / 週 / 年",
    "월 / 주 / 년"
  ],
  "Close dialog": [
    "关闭对话框",
    "ダイアログを閉じる",
    "대화상자 닫기"
  ],
  "My calendars": [
    "我的日历",
    "マイカレンダー",
    "내 캘린더"
  ],
  "Full dates": [
    "完整日期",
    "全日付",
    "전체 날짜"
  ],
  "Month": [
    "月",
    "月",
    "월"
  ],
  "Week": [
    "周",
    "週",
    "주"
  ],
  "View": [
    "视图",
    "表示",
    "보기"
  ],
  "view": [
    "视图",
    "表示",
    "보기"
  ],
  "Events": [
    "事件",
    "予定",
    "일정"
  ],
  "event": [
    "事件",
    "予定",
    "일정"
  ],
  "events": [
    "个事件",
    "件の予定",
    "개 일정"
  ],
  "To do": [
    "待办",
    "未完了",
    "할 일"
  ],
  "Completed": [
    "已完成",
    "完了",
    "완료"
  ],
  "Nothing planned for this day.": [
    "这一天没有安排。",
    "この日の予定はありません。",
    "이 날짜에 예정된 일정이 없습니다."
  ],
  "Completed events will appear here.": [
    "已完成的事件会显示在这里。",
    "完了した予定がここに表示されます。",
    "완료한 일정이 여기에 표시됩니다."
  ],
  "No events planned for this day.": [
    "这一天没有计划。",
    "この日の予定はありません。",
    "이 날짜에 계획된 일정이 없습니다."
  ],
  "All day": [
    "全天",
    "終日",
    "하루 종일"
  ],
  "Until": [
    "直到",
    "まで",
    "까지"
  ],
  "With": [
    "与",
    "と",
    "함께"
  ],
  "Repeat daily": [
    "每天重复",
    "毎日繰り返す",
    "매일 반복"
  ],
  "Repeats daily": [
    "每天重复",
    "毎日繰り返し",
    "매일 반복"
  ],
  "Repeats weekly": [
    "每周重复",
    "毎週繰り返し",
    "매주 반복"
  ],
  "Repeats monthly": [
    "每月重复",
    "毎月繰り返し",
    "매월 반복"
  ],
  "Repeats yearly": [
    "每年重复",
    "毎年繰り返し",
    "매년 반복"
  ],
  "Delete event": [
    "删除事件",
    "予定を削除",
    "일정 삭제"
  ],
  "Edit event": [
    "编辑事件",
    "予定を編集",
    "일정 수정"
  ],
  "No matching events or dates.": [
    "没有匹配的事件或日期。",
    "一致する予定や日付がありません。",
    "일치하는 일정이나 날짜가 없습니다."
  ],
  "No matching time zones. Try a city or region name.": [
    "没有匹配的时区。请尝试城市或地区名称。",
    "一致するタイムゾーンがありません。都市名や地域名をお試しください。",
    "일치하는 시간대가 없습니다. 도시 또는 지역 이름을 입력하세요."
  ],
  "Choose a time zone from the search results.": [
    "请从搜索结果中选择时区。",
    "検索結果からタイムゾーンを選択してください。",
    "검색 결과에서 시간대를 선택하세요."
  ],
  "Time zone preference saved": [
    "时区偏好已保存",
    "タイムゾーン設定を保存しました",
    "시간대 설정이 저장됨"
  ],
  "Profile saved": [
    "个人资料已保存",
    "プロフィールを保存しました",
    "프로필 저장됨"
  ],
  "Could not save settings in this browser.": [
    "无法在此浏览器中保存设置。",
    "このブラウザーでは設定を保存できませんでした。",
    "이 브라우저에서 설정을 저장할 수 없습니다."
  ],
  "End time must be later than start time.": [
    "结束时间必须晚于开始时间。",
    "終了時刻は開始時刻より後にしてください。",
    "종료 시간은 시작 시간보다 늦어야 합니다."
  ],
  "Add an event title.": [
    "请填写事件标题。",
    "予定のタイトルを入力してください。",
    "일정 제목을 입력하세요."
  ],
  "Add a valid event name and date.": [
    "请输入有效的事件名称和日期。",
    "有効な予定名と日付を入力してください。",
    "유효한 일정 이름과 날짜를 입력하세요."
  ],
  "Describe your event first.": [
    "请先描述事件。",
    "先に予定の内容を入力してください。",
    "먼저 일정 내용을 입력하세요."
  ],
  "Choose a valid event date.": [
    "请选择有效的事件日期。",
    "有効な日付を選択してください。",
    "유효한 날짜를 선택하세요."
  ],
  "Event added": [
    "事件已添加",
    "予定を追加しました",
    "일정 추가됨"
  ],
  "Event updated": [
    "事件已更新",
    "予定を更新しました",
    "일정 업데이트됨"
  ],
  "Event deleted": [
    "事件已删除",
    "予定を削除しました",
    "일정 삭제됨"
  ],
  "Event restored": [
    "事件已恢复",
    "予定を復元しました",
    "일정 복원됨"
  ],
  "Nothing new to import.": [
    "没有新内容可导入。",
    "インポートする新しい項目はありません。",
    "가져올 새 항목이 없습니다."
  ],
  "Your calendar is up to date across devices.": [
    "你的日历已在所有设备间保持同步。",
    "カレンダーはすべてのデバイスで最新です。",
    "캘린더가 모든 기기에서 최신 상태입니다."
  ],
  "You’re offline. Changes are saved here and will sync when you’re back online.": [
    "你当前处于离线状态。更改已保存在此处，联网后会同步。",
    "オフラインです。変更はここに保存され、再接続時に同期されます。",
    "오프라인 상태입니다. 변경 사항은 여기에 저장되며 다시 연결되면 동기화됩니다."
  ],
  "Browser storage is unavailable. Changes may not persist after closing this page.": [
    "浏览器存储不可用。关闭此页面后，更改可能无法保留。",
    "ブラウザーのストレージを利用できません。このページを閉じると変更が失われる可能性があります。",
    "브라우저 저장소를 사용할 수 없습니다. 페이지를 닫으면 변경 사항이 유지되지 않을 수 있습니다."
  ],
  "Authentication could not load. Check your connection, then refresh Calex.": [
    "无法加载身份验证。请检查网络连接后刷新 Calex。",
    "認証を読み込めませんでした。接続を確認して Calex を再読み込みしてください。",
    "인증을 불러올 수 없습니다. 연결을 확인한 후 Calex를 새로고침하세요."
  ],
  "Switch to dark appearance": [
    "切换为深色外观",
    "ダーク表示に切り替え",
    "어두운 화면으로 전환"
  ],
  "Switch to light appearance": [
    "切换为浅色外观",
    "ライト表示に切り替え",
    "밝은 화면으로 전환"
  ],
  "Close assistant": [
    "关闭助手",
    "アシスタントを閉じる",
    "어시스턴트 닫기"
  ],
  "Hide details": [
    "隐藏详情",
    "詳細を非表示",
    "세부 정보 숨기기"
  ],
  "Show details": [
    "显示详情",
    "詳細を表示",
    "세부 정보 표시"
  ],
  "Mark": [
    "标记",
    "マーク",
    "표시"
  ],
  "completed": [
    "已完成",
    "完了",
    "완료"
  ],
  "Edit": [
    "编辑",
    "編集",
    "수정"
  ],
  "until": [
    "直到",
    "まで",
    "까지"
  ],
  "of your day": [
    "你的一天",
    "今日の",
    "하루의"
  ],
  "events today": [
    "今天的事件",
    "今日の予定",
    "오늘의 일정"
  ],
  "ON THE CALENDAR": [
    "日历安排",
    "カレンダー上の予定",
    "캘린더 일정"
  ],
  "TIME COMMITTED": [
    "已安排时间",
    "予定に使う時間",
    "일정에 사용한 시간"
  ],
  "A LITTLE PROGRESS": [
    "一点进展",
    "少しずつ前進",
    "작은 진전"
  ],
  "Manage your account and sign-out options": [
    "管理账户和退出选项",
    "アカウントとサインアウトの設定を管理",
    "계정 및 로그아웃 옵션 관리"
  ],
  "Auto": [
    "自动",
    "自動",
    "자동"
  ],
  "System settings": [
    "系统设置",
    "システム設定",
    "시스템 설정"
  ]
};

  // Bundled translations are deliberately local: no page text is sent to a
  // translation API. Existing rows contain English, Spanish, French, and German.

  // Complete East Asian coverage for the phrase table, including legal copy and error states.
  Object.assign(ASIAN_TRANSLATIONS, {
    "Already used Google? Choose Google again. Email/password works only after you have set a password for that account.": [
      "已使用过 Google？请再次选择 Google。只有为该账户设置密码后，才能使用电子邮件和密码登录。",
      "Googleを利用したことがありますか？もう一度 Google を選択してください。メールアドレスとパスワードでのログインは、そのアカウントにパスワードを設定した後に利用できます。",
      "Google로 로그인한 적이 있나요? Google을 다시 선택하세요. 이메일과 비밀번호 로그인은 해당 계정에 비밀번호를 설정한 후에만 사용할 수 있습니다."
    ],
    "Choose a password for your confirmed account.": [
      "为已验证的账户设置密码。",
      "確認済みのアカウントにパスワードを設定してください。",
      "인증된 계정의 비밀번호를 설정하세요."
    ],
    "Your calendar syncs only when you are signed in. You can keep using Calex on this device without an account.": [
      "只有登录后，日历才会同步。即使没有账户，你仍可以在此设备上使用 Calex。",
      "カレンダーはサインイン中のみ同期されます。アカウントがなくても、このデバイスで Calex を引き続き利用できます。",
      "로그인한 경우에만 캘린더가 동기화됩니다. 계정이 없어도 이 기기에서 Calex를 계속 사용할 수 있습니다."
    ],
    "These details personalize your calendar on this device.": [
      "这些信息用于个性化此设备上的日历。",
      "これらの情報は、このデバイスのカレンダーをカスタマイズするために使用されます。",
      "이 정보는 이 기기의 캘린더를 개인화하는 데 사용됩니다."
    ],
    "Keep your calendar and preferences available across devices.": [
      "让你在不同设备上都能使用日历和偏好设置。",
      "複数のデバイスでカレンダーと設定を利用できるようにします。",
      "여러 기기에서 캘린더와 환경설정을 사용할 수 있습니다."
    ],
    "Sign in or create account": [
      "登录或创建账户",
      "サインインまたはアカウントを作成",
      "로그인 또는 계정 만들기"
    ],
    "Securely sync your calendar across devices": [
      "在不同设备间安全地同步日历",
      "デバイス間でカレンダーを安全に同期",
      "여러 기기에서 캘린더를 안전하게 동기화"
    ],
    "Your events stay on this device until you sign in.": [
      "登录之前，你的日程会保存在此设备上。",
      "サインインするまで、予定はこのデバイスに保存されます。",
      "로그인할 때까지 일정은 이 기기에 저장됩니다."
    ],
    "Sync now": [
      "立即同步",
      "今すぐ同期",
      "지금 동기화"
    ],
    "Try London, Tokyo, or UTC…": [
      "试试输入伦敦、东京或 UTC…",
      "ロンドン、東京、UTC などをお試しください…",
      "런던, 도쿄 또는 UTC를 입력해 보세요…"
    ],
    "Manual": [
      "手动",
      "手動",
      "수동"
    ],
    "What's on the horizon": [
      "接下来有什么安排",
      "これからの予定",
      "앞으로의 일정"
    ],
    "Help me plan a balanced day.": [
      "帮我规划充实而均衡的一天。",
      "バランスの取れた一日の計画を手伝ってください。",
      "균형 잡힌 하루를 계획하도록 도와주세요."
    ],
    "Find a 60-minute focus window in my upcoming calendar.": [
      "在我接下来的日程中找出一段 60 分钟的专注时间。",
      "今後の予定から60分間の集中できる時間帯を探してください。",
      "다가오는 일정에서 60분 동안 집중할 수 있는 시간을 찾아주세요."
    ],
    "Schedule a 30-minute weekly planning session tomorrow at 9am.": [
      "安排明天上午 9 点进行一次 30 分钟的每周计划会议。",
      "明日の午前9時に、30分間の週次計画セッションを予定してください。",
      "내일 오전 9시에 30분 동안 주간 계획 회의를 예약해 주세요."
    ],
    "YOU": [
      "你",
      "あなた",
      "나"
    ],
    "event today": [
      "今天的日程",
      "今日の予定",
      "오늘 일정"
    ],
    "Timed": [
      "定时",
      "時間指定",
      "시간 지정"
    ],
    "Repeating": [
      "重复",
      "繰り返し",
      "반복"
    ],
    "Add events from an .ics file (Google, Outlook, Apple)": [
      "从 .ics 文件添加日程（Google、Outlook、Apple）",
      ".ics ファイル（Google、Outlook、Apple）から予定を追加",
      ".ics 파일(Google, Outlook, Apple)에서 일정 추가"
    ],
    "When signed out, your calendar is stored on this device. Signing in enables account-based sync. You can export a copy of your events at any time.": [
      "退出登录时，日历会存储在此设备上。登录后即可通过账户同步。你可以随时导出日程副本。",
      "サインアウト中、カレンダーはこのデバイスに保存されます。サインインするとアカウント同期が有効になります。予定のコピーはいつでもエクスポートできます。",
      "로그아웃 상태에서는 캘린더가 이 기기에 저장됩니다. 로그인하면 계정 동기화를 사용할 수 있습니다. 일정 사본은 언제든지 내보낼 수 있습니다."
    ],
    "Terms of service": [
      "服务条款",
      "利用規約",
      "서비스 약관"
    ],
    "Rules and limitations for using Calex": [
      "使用 Calex 的规则和限制",
      "Calex の利用規則と制限",
      "Calex 이용 규칙 및 제한"
    ],
    "Privacy policy": [
      "隐私政策",
      "プライバシーポリシー",
      "개인정보 처리방침"
    ],
    "How calendar and account data are handled": [
      "日历和账户数据的处理方式",
      "カレンダーとアカウントデータの取り扱い",
      "캘린더 및 계정 데이터 처리 방식"
    ],
    "ABOUT": [
      "关于",
      "概要",
      "소개"
    ],
    "A calm, straightforward calendar for keeping track of your days.": [
      "一款简洁、平和的日历，帮助你安排每一天。",
      "毎日の予定を把握するための、落ち着いたシンプルなカレンダーです。",
      "하루를 정리할 수 있는 차분하고 간편한 캘린더입니다."
    ],
    "What you can do": [
      "你可以做什么",
      "できること",
      "사용 가능한 기능"
    ],
    "Create and manage events, browse dates, search your calendar, set a preferred time zone, and export events as an iCalendar (.ics) file.": [
      "创建和管理日程、浏览日期、搜索日历、设置首选时区，并将日程导出为 iCalendar（.ics）文件。",
      "予定の作成・管理、日付の確認、カレンダー検索、タイムゾーンの設定、iCalendar（.ics）形式での予定のエクスポートができます。",
      "일정을 만들고 관리하고, 날짜를 살펴보고, 캘린더를 검색하고, 원하는 시간대를 설정하며, 일정을 iCalendar(.ics) 파일로 내보낼 수 있습니다."
    ],
    "Your calendar, your choice": [
      "你的日历，由你决定",
      "あなたのカレンダーはあなた次第",
      "내 캘린더는 내가 선택"
    ],
    "You can use Calex on one device without signing in. Signing in enables account-based synchronisation where configured. You can export a copy of your events from Settings.": [
      "无需登录即可在一台设备上使用 Calex。配置完成后，登录可启用账户同步。你可以在“设置”中导出日程副本。",
      "サインインせずに1台のデバイスで Calex を利用できます。設定されている場合、サインインするとアカウント同期が有効になります。設定から予定のコピーをエクスポートできます。",
      "로그인하지 않고 한 기기에서 Calex를 사용할 수 있습니다. 설정된 경우 로그인하면 계정 동기화가 활성화됩니다. 설정에서 일정 사본을 내보낼 수 있습니다."
    ],
    "Help and feedback": [
      "帮助与反馈",
      "ヘルプとフィードバック",
      "도움말 및 의견"
    ],
    "Report a bug or request an improvement through the": [
      "你可以通过以下渠道报告错误或提出改进建议：",
      "不具合の報告や改善の提案は、次の窓口から送信できます：",
      "다음 경로를 통해 오류를 신고하거나 개선 사항을 제안하세요:"
    ],
    "Calex GitHub issue tracker": [
      "Calex 的 GitHub 问题跟踪页",
      "Calex の GitHub イシュートラッカー",
      "Calex GitHub 이슈 트래커"
    ],
    ". Do not include passwords, private event details, or other sensitive information in a public issue.": [
      "。请勿在公开问题中填写密码、私人日程详情或其他敏感信息。",
      "。公開の Issue には、パスワード、非公開の予定の詳細、その他の機密情報を記載しないでください。",
      "。공개 이슈에 비밀번호, 비공개 일정 세부 정보 또는 기타 민감한 정보를 포함하지 마세요."
    ],
    "LEGAL": [
      "法律信息",
      "法的事項",
      "법률 정보"
    ],
    "These terms explain the basic conditions for using Calex. By using the app, you agree to these terms. If you do not agree, stop using the app.": [
      "本条款说明使用 Calex 的基本条件。使用本应用即表示你同意这些条款。如不同意，请停止使用本应用。",
      "本規約では Calex を利用するための基本条件を説明します。本アプリを利用することで、本規約に同意したものとみなされます。同意しない場合は利用を中止してください。",
      "이 약관은 Calex 이용의 기본 조건을 설명합니다. 앱을 사용하면 이 약관에 동의하는 것입니다. 동의하지 않으면 앱 사용을 중단하세요."
    ],
    "1. The service": [
      "1. 服务",
      "1. サービス",
      "1. 서비스"
    ],
    "Calex provides calendar and event-management features, including local storage, optional account sign-in and synchronisation, time-zone preferences, and calendar export. Features may change, be unavailable, or be discontinued.": [
      "Calex 提供日历和日程管理功能，包括本地存储、可选的账户登录与同步、时区偏好设置以及日历导出。功能可能发生变化、暂时不可用或停止提供。",
      "Calex は、ローカル保存、任意のアカウントサインインと同期、タイムゾーン設定、カレンダーのエクスポートなど、カレンダーと予定の管理機能を提供します。機能は変更、停止、または利用できなくなる場合があります。",
      "Calex는 로컬 저장, 선택적 계정 로그인 및 동기화, 시간대 설정, 캘린더 내보내기 등 캘린더와 일정 관리 기능을 제공합니다. 기능은 변경되거나 사용할 수 없게 되거나 종료될 수 있습니다."
    ],
    "2. Your information and responsibilities": [
      "2. 정보와 사용자 책임",
      "2. 情報とユーザーの責任",
      "2. 정보 및 사용자 책임"
    ],
    "You are responsible for the accuracy of the events you enter and for keeping your account credentials secure. Do not use Calex as the only copy of important information. Export or otherwise back up events you cannot afford to lose.": [
      "你有责任确保输入的日程准确，并妥善保护账户凭据。请勿将 Calex 作为重要信息的唯一副本。对于不能丢失的日程，请导出或以其他方式备份。",
      "入力した予定の正確性と、アカウント認証情報の安全な管理は利用者の責任です。重要な情報の唯一の保存先として Calex を使用しないでください。失うことのできない予定は、エクスポートするなどして別途バックアップしてください。",
      "입력한 일정의 정확성과 계정 인증 정보를 안전하게 보관하는 것은 사용자의 책임입니다. 중요한 정보의 유일한 사본으로 Calex를 사용하지 마세요. 잃어서는 안 되는 일정은 내보내거나 다른 방법으로 백업하세요."
    ],
    "3. Acceptable use": [
      "3. 허용되는 사용",
      "3. 許容される利用",
      "3. 허용되는 사용"
    ],
    "Do not misuse the service, attempt to gain unauthorised access, interfere with its operation, or use it in a way that violates applicable law or another person's rights.": [
      "请勿滥用本服务、尝试未经授权访问、干扰服务运行，或以违反适用法律或他人权利的方式使用本服务。",
      "本サービスを悪用したり、不正アクセスを試みたり、運用を妨害したり、適用法令や他者の権利に反する方法で利用したりしないでください。",
      "서비스를 악용하거나, 무단 접근을 시도하거나, 운영을 방해하거나, 관련 법률 또는 타인의 권리를 침해하는 방식으로 사용하지 마세요."
    ],
    "4. Availability and data loss": [
      "4. 服务可用性与数据丢失",
      "4. 利用可能性とデータの消失",
      "4. 서비스 가용성 및 데이터 손실"
    ],
    "Calex is provided on an “as available” basis. We do not guarantee uninterrupted service, error-free operation, successful synchronisation, or permanent preservation of data. Device failure, browser settings, clearing site data, account issues, or service outages may affect access to events.": [
      "Calex 按“可用状态”提供。我们不保证服务不会中断、运行不会出错、同步一定成功或数据会永久保存。设备故障、浏览器设置、清除网站数据、账户问题或服务中断都可能影响日程访问。",
      "Calex は「提供可能な範囲」で提供されます。サービスの中断がないこと、エラーが発生しないこと、同期が必ず成功すること、データが永久に保存されることを保証しません。デバイスの故障、ブラウザー設定、サイトデータの消去、アカウントの問題、サービス停止により、予定にアクセスできなくなる場合があります。",
      "Calex는 ‘사용 가능한 상태로’ 제공됩니다. 서비스 중단 없음, 오류 없는 작동, 동기화 성공 또는 데이터의 영구 보존을 보장하지 않습니다. 기기 고장, 브라우저 설정, 사이트 데이터 삭제, 계정 문제 또는 서비스 중단으로 일정에 접근하지 못할 수 있습니다."
    ],
    "5. No professional advice or emergency service": [
      "5. 专业建议与紧急服务声明",
      "5. 専門的助言および緊急サービスではありません",
      "5. 전문 상담 또는 긴급 서비스가 아닙니다"
    ],
    "Calex is a general-purpose organisational tool. It is not a medical, legal, financial, or emergency service. You are responsible for checking event details, reminders, dates, and times that matter to you.": [
      "Calex 是通用的组织管理工具，并非医疗、法律、金融或紧急服务。你有责任检查对自己重要的日程详情、提醒、日期和时间。",
      "Calex は一般的な整理・管理ツールです。医療、法律、金融、緊急対応のサービスではありません。重要な予定の詳細、リマインダー、日付、時刻はご自身で確認してください。",
      "Calex는 일반적인 일정 관리 도구이며 의료, 법률, 금융 또는 긴급 서비스가 아닙니다. 중요한 일정 세부 정보, 알림, 날짜와 시간은 직접 확인해야 합니다."
    ],
    "6. Limitation of liability": [
      "6. 责任限制",
      "6. 責任の制限",
      "6. 책임 제한"
    ],
    "To the extent permitted by applicable law, Calex is not liable for indirect or consequential loss, missed appointments, or loss of calendar data arising from use of the service. Nothing in these terms excludes rights or liability that cannot lawfully be excluded.": [
      "在适用法律允许的范围内，Calex 不对因使用本服务而产生的间接或后果性损失、错过约会或日历数据丢失承担责任。本条款不排除法律规定不得排除的权利或责任。",
      "適用法令で認められる範囲において、Calex は本サービスの利用に起因する間接損害・結果的損害、予定の見落とし、カレンダーデータの消失について責任を負いません。本規約は、法律上排除できない権利や責任を排除するものではありません。",
      "관련 법률이 허용하는 범위에서 Calex는 서비스 사용으로 인한 간접적·결과적 손실, 약속 누락 또는 캘린더 데이터 손실에 대해 책임지지 않습니다. 이 약관은 법적으로 배제할 수 없는 권리나 책임을 배제하지 않습니다."
    ],
    "7. Changes to these terms": [
      "7. 条款变更",
      "7. 本規約の変更",
      "7. 약관 변경"
    ],
    "These terms may be updated as the app changes. The effective date above indicates the latest published version. Continued use after an update means you accept the revised terms where the law permits.": [
      "随着应用程序的发展，本条款可能会更新。上方的生效日期表示最新发布的版本。在法律允许的情况下，更新后继续使用即表示你接受修订后的条款。",
      "アプリの変更に伴い、本規約は更新される場合があります。上記の発効日は最新公開版を示します。法律で認められる範囲では、更新後も利用を続けることで改定後の規約に同意したものとみなされます。",
      "앱의 변경에 따라 이 약관은 업데이트될 수 있습니다. 위 시행일은 가장 최근에 게시된 버전을 나타냅니다. 법률이 허용하는 범위에서 업데이트 후에도 계속 사용하면 개정된 약관에 동의한 것으로 간주됩니다."
    ],
    "8. Contact": [
      "8. 联系方式",
      "8. お問い合わせ",
      "8. 문의"
    ],
    "For support or questions about these terms, use the": [
      "如需支持或咨询本条款，请使用：",
      "サポートや本規約に関するお問い合わせは、次をご利用ください：",
      "지원이 필요하거나 약관에 관해 문의하려면 다음을 이용하세요:"
    ],
    ". Do not post confidential information publicly.": [
      "。请勿公开发布机密信息。",
      "。機密情報を公開の場に投稿しないでください。",
      "。기밀 정보를 공개적으로 게시하지 마세요."
    ],
    "This policy describes how the current Calex app handles information. The precise handling of account data can depend on your sign-in and synchronisation configuration.": [
      "本政策说明当前版本的 Calex 如何处理信息。账户数据的具体处理方式可能取决于你的登录和同步配置。",
      "本ポリシーは、現在の Calex アプリにおける情報の取り扱いを説明します。アカウントデータの詳細な取り扱いは、サインインや同期の設定によって異なる場合があります。",
      "이 정책은 현재 Calex 앱이 정보를 처리하는 방식을 설명합니다. 계정 데이터의 구체적인 처리 방식은 로그인 및 동기화 설정에 따라 달라질 수 있습니다."
    ],
    "1. Information you enter": [
      "1. 你输入的信息",
      "1. 入力する情報",
      "1. 입력하는 정보"
    ],
    "Calendar events may include titles, descriptions, dates, times, locations, attendees or people, repeat settings, and notes. Profile preferences may include a display name, location, time-zone choice, and appearance preference. Avoid entering information you do not want stored in your calendar.": [
      "日历日程可能包含标题、描述、日期、时间、地点、参与者、重复设置和备注。个人资料偏好可能包含显示名称、位置、时区选择和外观偏好。请避免输入不希望保存在日历中的信息。",
      "カレンダーの予定には、タイトル、説明、日付、時刻、場所、参加者、繰り返し設定、メモが含まれる場合があります。プロフィール設定には、表示名、場所、タイムゾーン、表示スタイルの設定が含まれる場合があります。カレンダーに保存したくない情報は入力しないでください。",
      "캘린더 일정에는 제목, 설명, 날짜, 시간, 위치, 참석자, 반복 설정 및 메모가 포함될 수 있습니다. 프로필 설정에는 표시 이름, 위치, 시간대 및 화면 모양 설정이 포함될 수 있습니다. 캘린더에 저장하고 싶지 않은 정보는 입력하지 마세요."
    ],
    "2. Local storage": [
      "2. 本地存储",
      "2. ローカルストレージ",
      "2. 로컬 저장소"
    ],
    "When you use Calex while signed out, events and preferences are saved in your browser's local storage on that device. They are not automatically available on another device. Clearing browser/site data, using private browsing, or losing access to the device may remove locally stored information. Use the export feature to keep a separate copy.": [
      "退出登录时使用 Calex，日程和偏好设置会保存在该设备浏览器的本地存储中，不会自动同步到其他设备。清除浏览器或网站数据、使用无痕浏览模式或无法再访问该设备，都可能导致本地信息丢失。请使用导出功能保留单独副本。",
      "サインアウト中に Calex を利用すると、予定と設定はそのデバイスのブラウザーのローカルストレージに保存されます。別のデバイスでは自動的に利用できません。ブラウザーやサイトのデータ消去、プライベートブラウズの利用、デバイスへのアクセス喪失により、ローカルデータが削除される場合があります。エクスポート機能で別のコピーを保存してください。",
      "로그아웃 상태에서 Calex를 사용하면 일정과 환경설정이 해당 기기 브라우저의 로컬 저장소에 저장되며 다른 기기에서 자동으로 사용할 수 없습니다. 브라우저/사이트 데이터 삭제, 비공개 브라우징 사용 또는 기기에 대한 접근 권한 상실로 로컬 정보가 삭제될 수 있습니다. 내보내기 기능으로 별도 사본을 보관하세요."
    ],
    "3. Account and synchronisation": [
      "3. 账户与同步",
      "3. アカウントと同期",
      "3. 계정 및 동기화"
    ],
    "If you sign in and synchronisation is enabled, Calex uses Supabase authentication and its configured database service to authenticate your account and synchronise calendar events and preferences. This means relevant data may be transmitted to and stored by that service. Account-based data is associated with your account, subject to the app's database access policies and service configuration.": [
      "如果你登录并启用了同步，Calex 会使用 Supabase 身份验证及其配置的数据库服务来验证账户并同步日程和偏好设置。这意味着相关数据可能会传输给该服务并由其存储。账户数据会与你的账户关联，并受应用的数据库访问策略和服务配置约束。",
      "サインインして同期を有効にすると、Calex は Supabase 認証と設定済みのデータベースサービスを使用してアカウントを認証し、予定と設定を同期します。そのため、関連データが当該サービスに送信・保存される場合があります。アカウントに基づくデータは、アプリのデータベースアクセス方針とサービス設定に従ってアカウントに紐づけられます。",
      "로그인하고 동기화를 활성화하면 Calex는 Supabase 인증과 구성된 데이터베이스 서비스를 사용해 계정을 인증하고 일정과 환경설정을 동기화합니다. 이에 따라 관련 데이터가 해당 서비스로 전송되어 저장될 수 있습니다. 계정 기반 데이터는 앱의 데이터베이스 접근 정책과 서비스 구성에 따라 계정에 연결됩니다."
    ],
    "4. Time zone and device information": [
      "4. 时区与设备信息",
      "4. タイムゾーンとデバイス情報",
      "4. 시간대 및 기기 정보"
    ],
    "Automatic time-zone mode reads the time-zone identifier provided by your browser or device. Calex uses it to display your preference; the app does not need your precise GPS location for this feature. If you enter a location in your profile or an event, that text is stored as part of the relevant data.": [
      "自动时区模式会读取浏览器或设备提供的时区标识符。Calex 使用它来显示你的时区偏好，此功能不需要精确的 GPS 位置。如果你在个人资料或日程中输入地点，该文本会作为相关数据的一部分保存。",
      "タイムゾーンの自動モードは、ブラウザーまたはデバイスが提供するタイムゾーン識別子を読み取ります。Calex はそれを設定の表示に使用し、この機能に正確な GPS 位置情報は必要ありません。プロフィールや予定に場所を入力した場合、そのテキストは関連データの一部として保存されます。",
      "자동 시간대 모드는 브라우저나 기기가 제공하는 시간대 식별자를 읽습니다. Calex는 이를 환경설정 표시에 사용하며, 이 기능에 정확한 GPS 위치가 필요하지 않습니다. 프로필이나 일정에 위치를 입력하면 해당 텍스트가 관련 데이터의 일부로 저장됩니다."
    ],
    "5. Cookies, analytics, and third parties": [
      "5. Cookie、分析工具与第三方服务",
      "5. Cookie、分析、サードパーティ",
      "5. 쿠키, 분석 및 제3자 서비스"
    ],
    "Calex uses browser storage for app data and may load the Supabase client library from a content delivery network. The app's authentication and synchronisation features rely on Supabase when configured. Third-party infrastructure may process technical information under its own terms and policies; consult those policies for details.": [
      "Calex 使用浏览器存储保存应用数据，并可能从内容分发网络加载 Supabase 客户端库。配置完成后，应用的身份验证和同步功能会依赖 Supabase。第三方基础设施可能根据其自身条款和政策处理技术信息；详情请查阅相关政策。",
      "Calex はアプリデータの保存にブラウザーストレージを使用し、コンテンツ配信ネットワークから Supabase クライアントライブラリを読み込む場合があります。設定されている場合、認証と同期機能は Supabase に依存します。第三者のインフラは独自の規約とポリシーに基づいて技術情報を処理する場合があるため、詳細は各ポリシーを確認してください。",
      "Calex는 앱 데이터를 위해 브라우저 저장소를 사용하며 콘텐츠 전송 네트워크에서 Supabase 클라이언트 라이브러리를 불러올 수 있습니다. 구성된 경우 인증 및 동기화 기능은 Supabase에 의존합니다. 제3자 인프라는 자체 약관과 정책에 따라 기술 정보를 처리할 수 있으므로 자세한 내용은 해당 정책을 확인하세요."
    ],
    "Optional AI assistant": [
      "可选的 AI 助手",
      "オプションの AI アシスタント",
      "선택형 AI 어시스턴트"
    ],
    "The assistant loads Puter.js only when you enable it. Messages you submit are sent to Puter and its AI provider. Calendar context is off by default; turning it on shares upcoming event titles, dates, times, and locations for the next 14 days. Descriptions, notes, and people are not included. Chat history is kept only for this session. Puter authentication, usage allowances, and charges are separate from Calex. Review": [
      "只有在你启用助手后，才会加载 Puter.js。你提交的消息会发送给 Puter 及其 AI 服务提供商。日历上下文默认关闭；开启后，未来 14 天日程的标题、日期、时间和地点会被共享，不包括描述、备注和参与者。聊天记录仅保留在当前会话中。Puter 的身份验证、使用额度和费用均独立于 Calex。分享敏感信息前，请先查看",
      "アシスタントを有効にした場合にのみ Puter.js が読み込まれます。送信したメッセージは Puter とその AI プロバイダーに送られます。カレンダーコンテキストは既定でオフです。オンにすると、今後14日間の予定のタイトル、日付、時刻、場所が共有されます。説明、メモ、参加者は含まれません。チャット履歴はこのセッション中のみ保持されます。Puter の認証、利用枠、料金は Calex とは別です。機密情報を共有する前に",
      "어시스턴트를 활성화한 경우에만 Puter.js가 로드됩니다. 제출한 메시지는 Puter 및 해당 AI 제공업체로 전송됩니다. 캘린더 컨텍스트는 기본적으로 꺼져 있으며, 켜면 향후 14일간 일정의 제목, 날짜, 시간, 위치가 공유됩니다. 설명, 메모, 참석자는 포함되지 않습니다. 채팅 기록은 현재 세션에만 유지됩니다. Puter 인증, 사용 한도 및 요금은 Calex와 별개입니다. 민감한 정보를 공유하기 전에"
    ],
    "Puter's privacy policy": [
      "Puter 的隐私政策",
      "Puter のプライバシーポリシー",
      "Puter 개인정보 처리방침"
    ],
    "before sharing sensitive information. AI suggestions are not saved until you review and confirm them in the event editor.": [
      "，请先阅读其政策。AI 建议只有在你于日程编辑器中检查并确认后才会保存。",
      "、ポリシーを確認してください。AI の提案は、予定編集画面で確認して確定するまで保存されません。",
      "정책을 확인하세요. AI 제안은 일정 편집기에서 검토하고 확인할 때까지 저장되지 않습니다."
    ],
    "6. Sharing and disclosure": [
      "6. 信息共享与披露",
      "6. 共有と開示",
      "6. 공유 및 공개"
    ],
    "Calex does not provide a public calendar-sharing feature in the current interface. Data may be processed by the infrastructure providers required to operate sign-in and synchronisation, or disclosed where required by law. Anyone with access to your unlocked device or account may be able to access your calendar.": [
      "当前界面中的 Calex 不提供公开分享日历的功能。为提供登录和同步服务所需的基础设施提供商可能会处理数据；法律要求时也可能披露数据。任何能够访问你已解锁设备或账户的人，都可能访问你的日历。",
      "現在の Calex のインターフェースには、カレンダーを一般公開する機能はありません。サインインと同期の運用に必要なインフラ提供者がデータを処理する場合や、法律により開示が求められる場合があります。ロック解除済みのデバイスやアカウントにアクセスできる人は、カレンダーを閲覧できる可能性があります。",
      "현재 Calex 인터페이스에는 캘린더 공개 공유 기능이 없습니다. 로그인 및 동기화 운영에 필요한 인프라 제공업체가 데이터를 처리하거나 법률에 따라 데이터가 공개될 수 있습니다. 잠금 해제된 기기나 계정에 접근할 수 있는 사람은 캘린더를 볼 수 있습니다."
    ],
    "7. Retention and deletion": [
      "7. 보관 및 삭제",
      "7. 保持と削除",
      "7. 보관 및 삭제"
    ],
    "Local data remains in your browser until you remove it or the browser clears it. Signed-in data may remain in the configured cloud database until deleted through supported app or account-management processes or by the service operator. Export your events before clearing local data or changing accounts. If you need account data deleted, contact the app maintainer through the link below; do not include private event details in a public request.": [
      "本地数据会一直保留在浏览器中，直到你将其删除或浏览器清除数据。登录后的数据可能会保留在配置的云数据库中，直到通过应用或账户管理支持的流程删除，或由服务运营方删除。清除本地数据或更换账户前，请先导出日程。如需删除账户数据，请通过下方链接联系应用维护者；请勿在公开请求中包含私人日程详情。",
      "ローカルデータは、削除するかブラウザーによって消去されるまで保存されます。サインイン中のデータは、対応するアプリまたはアカウント管理の手続きで削除するか、サービス運営者が削除するまで、設定済みのクラウドデータベースに残る場合があります。ローカルデータを消去したりアカウントを変更したりする前に予定をエクスポートしてください。アカウントデータの削除が必要な場合は、下のリンクからアプリの管理者に連絡してください。公開リクエストに個人的な予定の詳細を含めないでください。",
      "로컬 데이터는 직접 삭제하거나 브라우저가 지울 때까지 브라우저에 남아 있습니다. 로그인한 데이터는 지원되는 앱 또는 계정 관리 절차나 서비스 운영자가 삭제할 때까지 구성된 클라우드 데이터베이스에 남아 있을 수 있습니다. 로컬 데이터를 지우거나 계정을 변경하기 전에 일정을 내보내세요. 계정 데이터 삭제가 필요하면 아래 링크를 통해 앱 관리자에게 문의하고, 공개 요청에 개인 일정 세부 정보를 포함하지 마세요."
    ],
    "8. Your choices and security": [
      "8. 你的选择与安全",
      "8. 選択肢とセキュリティ",
      "8. 선택 사항 및 보안"
    ],
    "You can use Calex without signing in, choose whether to enable account synchronisation, export your calendar, and avoid entering unnecessary personal information. No online service can guarantee absolute security, so use a strong unique password and protect access to your device.": [
      "你可以不登录使用 Calex，自行决定是否启用账户同步，导出日历，并避免输入不必要的个人信息。任何在线服务都无法保证绝对安全，因此请使用高强度且唯一的密码，并保护好设备访问权限。",
      "サインインせずに Calex を利用し、アカウント同期を有効にするか選択し、カレンダーをエクスポートし、不要な個人情報の入力を避けることができます。絶対的な安全性を保証できるオンラインサービスはないため、強固で使い回しのないパスワードを使用し、デバイスへのアクセスを保護してください。",
      "로그인하지 않고 Calex를 사용하거나 계정 동기화 여부를 선택하고, 캘린더를 내보내고, 불필요한 개인정보 입력을 피할 수 있습니다. 어떤 온라인 서비스도 완벽한 보안을 보장할 수 없으므로 강력하고 고유한 비밀번호를 사용하고 기기 접근을 보호하세요."
    ],
    "9. Children and sensitive information": [
      "9. 儿童与敏感信息",
      "9. 子どもと機密情報",
      "9. 아동 및 민감한 정보"
    ],
    "Do not use Calex to store highly sensitive information unless you have assessed that it is appropriate for your circumstances and the service configuration. If you are using Calex under a parent's or organisation's guidance, follow their applicable rules.": [
      "除非你已确认根据自身情况和服务配置存储高度敏感信息是合适的，否则请勿使用 Calex 保存此类信息。如果你在家长或组织的指导下使用 Calex，请遵循适用的相关规则。",
      "ご自身の状況とサービス設定に照らして適切だと判断できる場合を除き、非常に機密性の高い情報を Calex に保存しないでください。保護者や組織の指導のもとで Calex を使用している場合は、適用される規則に従ってください。",
      "개인 상황과 서비스 설정을 검토해 적절하다고 판단한 경우가 아니라면 매우 민감한 정보를 Calex에 저장하지 마세요. 보호자나 조직의 지침에 따라 Calex를 사용한다면 해당 규칙을 따르세요."
    ],
    "10. Policy changes and contact": [
      "10. 政策变更与联系方式",
      "10. ポリシーの変更とお問い合わせ",
      "10. 정책 변경 및 문의"
    ],
    "This policy may change as Calex evolves. For privacy questions or deletion requests, contact the maintainer through the": [
      "随着 Calex 的发展，本政策可能会发生变化。如有隐私问题或数据删除请求，请通过以下方式联系维护者：",
      "Calex の変更に伴い、本ポリシーは改定される場合があります。プライバシーに関する質問や削除依頼は、次の窓口から管理者に連絡してください：",
      "Calex의 발전에 따라 이 정책은 변경될 수 있습니다. 개인정보 관련 문의나 삭제 요청은 다음 경로를 통해 관리자에게 연락하세요:"
    ],
    ". Public issues are visible to others, so request a private contact route before sharing personal data.": [
      "。公开问题对其他人可见，因此在分享个人数据前，请先索取私密联系方式。",
      "。公開 Issue は他の人にも見えるため、個人データを共有する前に非公開の連絡方法を確認してください。",
      "。공개 이슈는 다른 사람에게도 보이므로 개인정보를 공유하기 전에 비공개 연락 방법을 요청하세요."
    ],
    "WORKSPACE": [
      "工作区",
      "ワークスペース",
      "워크스페이스"
    ],
    "A little help planning": [
      "规划小帮手",
      "計画を少しお手伝い",
      "계획 도우미"
    ],
    "Meet your Calex assistant": [
      "认识 Calex 助手",
      "Calex アシスタントの紹介",
      "Calex 어시스턴트 만나기"
    ],
    "Made for your everyday": [
      "为日常生活而设计",
      "毎日のために",
      "일상을 위해 만들었습니다"
    ],
    "Try “Team meeting tomorrow 10:07 to 20:00”, “Gym every Monday at 6pm”, or “Lunch on 14 June at noon”. We’ll interpret common dates, times and repeats.": [
      "试试输入“明天 10:07 至 20:00 团队会议”、“每周一下午 6 点健身”或“6 月 14 日中午午餐”。我们会识别常见的日期、时间和重复安排。",
      "「明日 10:07〜20:00 チーム会議」「毎週月曜18時にジム」「6月14日正午にランチ」などを試してください。一般的な日付、時刻、繰り返しを解釈します。",
      "“내일 10:07~20:00 팀 회의”, “매주 월요일 오후 6시 운동”, “6월 14일 정오 점심” 등을 입력해 보세요. 일반적인 날짜, 시간 및 반복 일정을 해석합니다."
    ],
    "A LITTLE CLARITY": [
      "更清晰一点",
      "少し整理しましょう",
      "조금 더 명확하게"
    ],
    "Less juggling.": [
      "减少忙乱。",
      "やりくりの負担を減らす。",
      "복잡함은 줄이고."
    ],
    "More breathing room.": [
      "留出更多余地。",
      "ゆとりを増やす。",
      "여유는 더하고."
    ],
    "Plan your day, find a focus window, or turn an idea into an event.": [
      "规划一天、寻找专注时段，或将想法变成日程。",
      "一日の計画を立てたり、集中できる時間帯を探したり、アイデアを予定に変えたりできます。",
      "하루를 계획하고, 집중 시간을 찾고, 아이디어를 일정으로 만들 수 있습니다."
    ],
    "Powered by Puter. Your own account handles AI access and any usage costs. Only messages you send are shared unless you enable calendar context.": [
      "由 Puter 提供支持。AI 访问和相关使用费用由你自己的账户处理。除非启用日历上下文，否则只会共享你发送的消息。",
      "Puter を利用しています。AI へのアクセスと利用料金はご自身のアカウントで管理されます。カレンダーコンテキストを有効にしない限り、送信したメッセージのみが共有されます。",
      "Puter 기반 서비스입니다. AI 접근 및 사용 요금은 본인 계정에서 처리됩니다. 캘린더 컨텍스트를 활성화하지 않는 한 보낸 메시지만 공유됩니다."
    ],
    "Enable Puter assistant": [
      "启用 Puter 助手",
      "Puter アシスタントを有効にする",
      "Puter 어시스턴트 활성화"
    ],
    "Share next 14 days (titles, times, locations)": [
      "共享未来 14 天（日程标题、时间和地点）",
      "今後14日間を共有（タイトル、時刻、場所）",
      "향후 14일 공유(제목, 시간, 위치)"
    ],
    "AI can make mistakes. Review dates and times before saving.": [
      "AI 可能会出错。保存前请检查日期和时间。",
      "AI は間違えることがあります。保存する前に日付と時刻を確認してください。",
      "AI는 실수할 수 있습니다. 저장하기 전에 날짜와 시간을 확인하세요."
    ],
    "Make time for shortcuts": [
      "为快捷操作留出时间",
      "ショートカットを活用する",
      "단축 기능을 활용하세요"
    ],
    "Appearance changed for this session, but could not be saved.": [
      "外观已在本次会话中更改，但未能保存。",
      "表示設定はこのセッション中に変更されましたが、保存できませんでした。",
      "화면 모양이 이번 세션에서는 변경되었지만 저장하지 못했습니다."
    ],
    "No events found in that file.": [
      "该文件中没有找到日程。",
      "そのファイルに予定が見つかりませんでした。",
      "해당 파일에서 일정을 찾을 수 없습니다."
    ],
    "Couldn’t read that file. Is it a valid .ics calendar?": [
      "无法读取该文件。它是有效的 .ics 日历文件吗？",
      "ファイルを読み取れませんでした。有効な .ics カレンダーですか？",
      "파일을 읽을 수 없습니다. 올바른 .ics 캘린더 파일인가요?"
    ],
    "Couldn’t sync. Your changes are saved on this device.": [
      "无法同步。你的更改已保存在此设备上。",
      "同期できませんでした。変更はこのデバイスに保存されています。",
      "동기화하지 못했습니다. 변경 사항은 이 기기에 저장되었습니다."
    ],
    "Couldn’t sync just now. Your changes are safe on this device. Tap Sync now to retry.": [
      "暂时无法同步。你的更改已安全保存在此设备上。点按“立即同步”重试。",
      "現在同期できませんでした。変更はこのデバイスに安全に保存されています。「今すぐ同期」をタップして再試行してください。",
      "지금은 동기화할 수 없습니다. 변경 사항은 이 기기에 안전하게 저장되었습니다. 다시 시도하려면 ‘지금 동기화’를 누르세요."
    ],
    "Browser storage is unavailable. Events last only for this session. Export a backup from Settings.": [
      "浏览器存储不可用。日程只会保留到本次会话结束。请在设置中导出备份。",
      "ブラウザーストレージを利用できません。予定はこのセッション中のみ保持されます。設定からバックアップをエクスポートしてください。",
      "브라우저 저장소를 사용할 수 없습니다. 일정은 이번 세션 동안만 유지됩니다. 설정에서 백업을 내보내세요."
    ],
    "Events · chronological": [
      "日程 · 按时间顺序",
      "予定 · 時系列",
      "일정 · 시간순"
    ],
    "Make yourself at home": [
      "按自己的习惯使用",
      "自分らしく使いましょう",
      "편하게 사용하세요"
    ],
    "A little space for everything": [
      "为每件事留出一点空间",
      "すべてに少しずつ余裕を",
      "모든 일을 위한 작은 여유"
    ],
    "Your privacy matters": [
      "你的隐私很重要",
      "プライバシーを大切に",
      "개인정보 보호는 중요합니다"
    ],
    "Authentication library is unavailable. Refresh and try again.": [
      "身份验证库不可用。请刷新页面后重试。",
      "認証ライブラリを利用できません。ページを更新して再試行してください。",
      "인증 라이브러리를 사용할 수 없습니다. 새로고침한 뒤 다시 시도하세요."
    ],
    "Could not load authentication. Refresh and try again.": [
      "无法加载身份验证功能。请刷新页面后重试。",
      "認証機能を読み込めませんでした。ページを更新して再試行してください。",
      "인증 기능을 불러오지 못했습니다. 새로고침한 뒤 다시 시도하세요."
    ],
    "Could not contact authentication. Check your connection and try again.": [
      "无法连接身份验证服务。请检查网络连接后重试。",
      "認証サービスに接続できませんでした。接続を確認して再試行してください。",
      "인증 서비스에 연결할 수 없습니다. 연결을 확인하고 다시 시도하세요."
    ],
    "Could not request a confirmation email.": [
      "无法请求发送确认邮件。",
      "確認メールをリクエストできませんでした。",
      "확인 이메일을 요청하지 못했습니다."
    ],
    "Could not request a reset. Please try again.": [
      "无法请求重置密码，请重试。",
      "リセットをリクエストできませんでした。もう一度お試しください。",
      "재설정을 요청하지 못했습니다. 다시 시도하세요."
    ],
    "Could not restore your sign-in session. Please try again.": [
      "无法恢复登录会话，请重试。",
      "サインインセッションを復元できませんでした。もう一度お試しください。",
      "로그인 세션을 복원하지 못했습니다. 다시 시도하세요."
    ],
    "Could not set a password.": [
      "无法设置密码。",
      "パスワードを設定できませんでした。",
      "비밀번호를 설정하지 못했습니다."
    ],
    "Authentication could not complete. Check your connection and try again.": [
      "身份验证未能完成。请检查网络连接后重试。",
      "認証を完了できませんでした。接続を確認して再試行してください。",
      "인증을 완료하지 못했습니다. 연결을 확인하고 다시 시도하세요."
    ],
    "Enter your email first.": [
      "请先输入电子邮件地址。",
      "先にメールアドレスを入力してください。",
      "먼저 이메일 주소를 입력하세요."
    ],
    "Enter a valid email address before requesting a confirmation.": [
      "请求确认邮件前，请输入有效的电子邮件地址。",
      "確認メールをリクエストする前に、有効なメールアドレスを入力してください。",
      "확인 이메일을 요청하기 전에 유효한 이메일 주소를 입력하세요."
    ],
    "Enter a valid email and password of at least 6 characters.": [
      "请输入有效的电子邮件地址和至少 6 个字符的密码。",
      "有効なメールアドレスと6文字以上のパスワードを入力してください。",
      "유효한 이메일 주소와 6자 이상의 비밀번호를 입력하세요."
    ],
    "Google sign-in could not start.": [
      "无法启动 Google 登录。",
      "Google サインインを開始できませんでした。",
      "Google 로그인을 시작하지 못했습니다."
    ],
    "Google sign-in must run outside this embedded preview. Open the live Calex site using the link below, then choose Continue with Google.": [
      "Google 登录必须在此嵌入式预览之外进行。请使用下方链接打开正式版 Calex 网站，然后选择“使用 Google 继续”。",
      "Google サインインは埋め込みプレビューの外で行う必要があります。下のリンクから Calex の公開サイトを開き、「Google で続行」を選択してください。",
      "Google 로그인은 이 내장 미리보기 외부에서 진행해야 합니다. 아래 링크로 Calex 실제 사이트를 연 다음 ‘Google로 계속’을 선택하세요."
    ],
    "Passwords do not match.": [
      "两次输入的密码不一致。",
      "パスワードが一致しません。",
      "비밀번호가 일치하지 않습니다."
    ],
    "Your email is not confirmed yet. Check your inbox and spam folder, or request a new confirmation below.": [
      "你的电子邮件地址尚未确认。请检查收件箱和垃圾邮件文件夹，或在下方重新请求确认邮件。",
      "メールアドレスがまだ確認されていません。受信トレイと迷惑メールフォルダーを確認するか、下から確認メールを再送信してください。",
      "이메일 주소가 아직 확인되지 않았습니다. 받은편지함과 스팸 폴더를 확인하거나 아래에서 확인 이메일을 다시 요청하세요."
    ],
    "Password reset requested. If an account exists for this email, check your inbox and spam folder.": [
      "已请求重置密码。如果此邮箱存在账户，请检查收件箱和垃圾邮件文件夹。",
      "パスワードのリセットをリクエストしました。このメールアドレスのアカウントがある場合は、受信トレイと迷惑メールフォルダーを確認してください。",
      "비밀번호 재설정이 요청되었습니다. 이 이메일 주소로 된 계정이 있다면 받은편지함과 스팸 폴더를 확인하세요."
    ],
    "Password set. You can now use email/password or Google for this account.": [
      "密码已设置。现在可以使用电子邮件/密码或 Google 登录此账户。",
      "パスワードを設定しました。このアカウントでは、メールアドレスとパスワード、または Google でサインインできます。",
      "비밀번호가 설정되었습니다. 이제 이 계정에서 이메일/비밀번호 또는 Google로 로그인할 수 있습니다."
    ],
    "Signed in. Your calendar is connected.": [
      "已登录。日历已连接。",
      "サインインしました。カレンダーが接続されています。",
      "로그인했습니다. 캘린더가 연결되었습니다."
    ],
    "Signed out": [
      "已退出登录",
      "サインアウトしました",
      "로그아웃됨"
    ],
    "Sign-in request completed": [
      "登录请求已完成",
      "サインイン要求が完了しました",
      "로그인 요청 완료"
    ],
    "Account created": [
      "账户已创建",
      "アカウントを作成しました",
      "계정이 생성되었습니다"
    ],
    "Account connected": [
      "账户已连接",
      "アカウントを接続しました",
      "계정이 연결되었습니다"
    ],
    "Account sync enabled": [
      "已启用账户同步",
      "アカウント同期を有効にしました",
      "계정 동기화가 활성화되었습니다"
    ],
    "Sync needs attention": [
      "同步需要处理",
      "同期に注意が必要です",
      "동기화 확인이 필요합니다"
    ],
    "Offline · saved locally": [
      "离线 · 已在本地保存",
      "オフライン · ローカルに保存済み",
      "오프라인 · 로컬에 저장됨"
    ],
    "Offline, still organised": [
      "离线也能保持井井有条",
      "オフラインでも整理をキープ",
      "오프라인에서도 정리된 상태 유지"
    ],
    "Storage unavailable · export a backup": [
      "存储不可用 · 导出备份",
      "ストレージを利用できません · バックアップをエクスポート",
      "저장소를 사용할 수 없음 · 백업 내보내기"
    ],
    "Loading Puter…": [
      "正在加载 Puter…",
      "Puter を読み込み中…",
      "Puter 로드 중…"
    ],
    "Sign in to Puter": [
      "登录 Puter",
      "Puter にサインイン",
      "Puter에 로그인"
    ],
    "Ready. Click Sign in to open Puter's account window.": [
      "准备就绪。点击“登录”以打开 Puter 账户窗口。",
      "準備完了です。「サインイン」をクリックして Puter のアカウントウィンドウを開いてください。",
      "준비되었습니다. ‘로그인’을 클릭해 Puter 계정 창을 여세요."
    ],
    "Sign-in did not finish. Please try again.": [
      "登录未能完成，请重试。",
      "サインインが完了しませんでした。もう一度お試しください。",
      "로그인이 완료되지 않았습니다. 다시 시도하세요."
    ],
    "The assistant needs an internet connection. Your calendar still works offline.": [
      "助手需要互联网连接。你的日历仍可离线使用。",
      "アシスタントにはインターネット接続が必要ですが、カレンダーはオフラインでも使用できます。",
      "어시스턴트는 인터넷 연결이 필요하지만 캘린더는 오프라인에서도 작동합니다."
    ],
    "Enable the assistant and sign in to Puter first.": [
      "请先启用助手并登录 Puter。",
      "先にアシスタントを有効にして Puter にサインインしてください。",
      "먼저 어시스턴트를 활성화하고 Puter에 로그인하세요."
    ],
    "You're offline. Reconnect to use the assistant.": [
      "你当前处于离线状态。请重新连接网络以使用助手。",
      "オフラインです。アシスタントを使用するには再接続してください。",
      "오프라인 상태입니다. 어시스턴트를 사용하려면 다시 연결하세요."
    ],
    "Making a little room for thought…": [
      "正在腾出一点思考空间…",
      "考えるための少しの余裕を作っています…",
      "생각할 여유를 만들고 있어요…"
    ],
    "Please try rephrasing that.": [
      "请尝试换一种说法。",
      "別の表現で試してください。",
      "다른 표현으로 다시 시도해 보세요."
    ],
    "Review event": [
      "检查日程",
      "予定を確認",
      "일정 검토"
    ],
    "The suggested event had invalid details. Ask the assistant to correct them.": [
      "建议的日程包含无效信息。请让助手进行更正。",
      "提案された予定の詳細が無効です。アシスタントに修正を依頼してください。",
      "제안된 일정에 유효하지 않은 정보가 있습니다. 어시스턴트에게 수정을 요청하세요."
    ],
    "We couldn't finish that request.": [
      "无法完成该请求。",
      "リクエストを完了できませんでした。",
      "요청을 완료하지 못했습니다."
    ],
    "The assistant returned an unreadable response. Please try again.": [
      "助手返回了无法读取的响应，请重试。",
      "アシスタントが読み取れない応答を返しました。もう一度お試しください。",
      "어시스턴트가 읽을 수 없는 응답을 반환했습니다. 다시 시도하세요."
    ],
    "Calendar context not shared. Do not invent existing events or availability.": [
      "未共享日历上下文。请勿编造现有日程或可用时间。",
      "カレンダーのコンテキストは共有されていません。既存の予定や空き時間を作り上げないでください。",
      "캘린더 컨텍스트가 공유되지 않았습니다. 기존 일정이나 가능한 시간을 지어내지 마세요."
    ],
    "Calendar context removed. Future requests start with a fresh conversation.": [
      "日历上下文已移除。后续请求将从新的对话开始。",
      "カレンダーのコンテキストを削除しました。次のリクエストは新しい会話として開始されます。",
      "캘린더 컨텍스트가 삭제되었습니다. 이후 요청은 새 대화에서 시작됩니다."
    ],
    "Upcoming titles, dates, times, and locations will be shared with your next message.": [
      "接下来日程的标题、日期、时间和地点将随你的下一条消息共享。",
      "今後の予定のタイトル、日付、時刻、場所が次のメッセージとともに共有されます。",
      "다가오는 일정의 제목, 날짜, 시간 및 위치가 다음 메시지와 함께 공유됩니다."
    ],
    "Nothing planned": [
      "暂无安排",
      "予定なし",
      "예정 없음"
    ],
    "A little breathing room.": [
      "留一点喘息空间。",
      "少しゆとりを。",
      "조금의 여유."
    ],
    "Your day is yours to shape. Add something worth making time for.": [
      "你可以安排属于自己的一天。添加一件值得为之留出时间的事吧。",
      "一日の過ごし方はあなた次第です。時間をかけたいことを追加しましょう。",
      "하루는 스스로 만들어 가세요. 시간을 쓸 가치가 있는 일을 추가하세요."
    ],
    "Add your first event": [
      "添加你的第一个日程",
      "最初の予定を追加",
      "첫 일정 추가"
    ],
    "The next chapter is unwritten.": [
      "下一篇章尚待书写。",
      "次の章はまだ白紙です。",
      "다음 장은 아직 쓰이지 않았습니다."
    ],
    "Add an event to start shaping the days ahead.": [
      "添加一个日程，开始规划接下来的日子。",
      "予定を追加して、これからの日々を形にしましょう。",
      "일정을 추가해 앞으로의 날들을 계획해 보세요."
    ],
    "A valid time is required.": [
      "请输入有效时间。",
      "有効な時刻を入力してください。",
      "유효한 시간을 입력해야 합니다."
    ],
    "This follows your device setting automatically.": [
      "此选项会自动遵循设备设置。",
      "デバイスの設定に自動的に従います。",
      "기기 설정을 자동으로 따릅니다."
    ],
    "Selected:": [
      "已选择：",
      "選択済み：",
      "선택됨:"
    ],
    "Save to apply.": [
      "保存以应用更改。",
      "適用するには保存してください。",
      "적용하려면 저장하세요."
    ],
    "Existing event dates and times are not converted.": [
      "现有日程的日期和时间不会转换。",
      "既存の予定の日付と時刻は変換されません。",
      "기존 일정의 날짜와 시간은 변환되지 않습니다."
    ],
    "The assistant could not load. Check your connection and retry.": [
      "无法加载助手。请检查网络连接后重试。",
      "アシスタントを読み込めませんでした。接続を確認して再試行してください。",
      "어시스턴트를 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요."
    ],
    "Could not load Puter. Check your connection and retry.": [
      "无法加载 Puter。请检查网络连接后重试。",
      "Puter を読み込めませんでした。接続を確認して再試行してください。",
      "Puter를 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요."
    ],
    "Puter could not complete this request. Check your account access and try again.": [
      "Puter 无法完成此请求。请检查账户访问权限后重试。",
      "Puter はリクエストを完了できませんでした。アカウントへのアクセスを確認して再試行してください。",
      "Puter가 요청을 완료하지 못했습니다. 계정 접근 권한을 확인하고 다시 시도하세요."
    ],
    "Puter could not initialise.": [
      "Puter 无法初始化。",
      "Puter を初期化できませんでした。",
      "Puter를 초기화하지 못했습니다."
    ],
    "Puter took too long to load. Check your connection and retry.": [
      "Puter 加载超时。请检查网络连接后重试。",
      "Puter の読み込みに時間がかかりすぎています。接続を確認して再試行してください。",
      "Puter 로딩 시간이 너무 깁니다. 연결을 확인하고 다시 시도하세요."
    ],
    "Toggle appearance": [
      "切换外观",
      "表示を切り替え",
      "화면 모양 전환"
    ],
    "Close filters": [
      "关闭筛选器",
      "フィルターを閉じる",
      "필터 닫기"
    ],
    "Close shortcuts": [
      "关闭快捷键面板",
      "ショートカットを閉じる",
      "단축키 닫기"
    ],
    "Calendar: Month view": [
      "日历：月视图",
      "カレンダー：月表示",
      "캘린더: 월 보기"
    ],
    "Calendar: Week view": [
      "日历：周视图",
      "カレンダー：週表示",
      "캘린더: 주 보기"
    ],
    "Calendar: Full dates view": [
      "日历：完整日期视图",
      "カレンダー：全日付表示",
      "캘린더: 전체 날짜 보기"
    ],
    "Full dates view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.": [
      "完整日期视图。向上拖动可切换到月视图或周视图，向下拖动可返回完整日期视图。键盘快捷键：M、W、Y。",
      "全日付表示です。上にドラッグすると月・週表示、下にドラッグすると全日付表示になります。キーボードショートカット：M、W、Y。",
      "전체 날짜 보기입니다. 위로 드래그하면 월/주 보기, 아래로 드래그하면 전체 날짜 보기로 전환됩니다. 키보드 단축키: M, W, Y."
    ],
    "Month view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.": [
      "月视图。向上拖动可切换到月视图或周视图，向下拖动可返回完整日期视图。键盘快捷键：M、W、Y。",
      "月表示です。上にドラッグすると月・週表示、下にドラッグすると全日付表示になります。キーボードショートカット：M、W、Y。",
      "월 보기입니다. 위로 드래그하면 월/주 보기, 아래로 드래그하면 전체 날짜 보기로 전환됩니다. 키보드 단축키: M, W, Y."
    ],
    "Week view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.": [
      "周视图。向上拖动可切换到月视图或周视图，向下拖动可返回完整日期视图。键盘快捷键：M、W、Y。",
      "週表示です。上にドラッグすると月・週表示、下にドラッグすると全日付表示になります。キーボードショートカット：M、W、Y。",
      "주 보기입니다. 위로 드래그하면 월/주 보기, 아래로 드래그하면 전체 날짜 보기로 전환됩니다. 키보드 단축키: M, W, Y."
    ],
    "of": [
      "共",
      "中",
      "중"
    ],
    "Please choose a language.": [
      "请选择一种语言。",
      "言語を選択してください。",
      "언어를 선택하세요."
    ],
    "Reset link accepted. Choose a new password below.": [
      "密码重置链接已验证。请在下方设置新密码。",
      "パスワードリセットリンクを確認しました。下で新しいパスワードを設定してください。",
      "비밀번호 재설정 링크가 확인되었습니다. 아래에서 새 비밀번호를 설정하세요."
    ],
    "Rule-based preview": [
      "基于规则的预览",
      "ルールベースのプレビュー",
      "규칙 기반 미리보기"
    ],
    "Supabase could not send the email. The app maintainer needs to check SMTP settings and Auth delivery logs.": [
      "Supabase 无法发送邮件。应用维护者需要检查 SMTP 设置和身份验证邮件投递日志。",
      "Supabase はメールを送信できませんでした。アプリ管理者は SMTP 設定と Auth の配信ログを確認する必要があります。",
      "Supabase가 이메일을 보내지 못했습니다. 앱 관리자는 SMTP 설정과 Auth 전송 로그를 확인해야 합니다."
    ],
    "The email service cannot send to this address. The app maintainer must configure custom SMTP in Supabase. You can also try Google sign-in.": [
      "邮件服务无法向此地址发送邮件。应用维护者必须在 Supabase 中配置自定义 SMTP。你也可以尝试使用 Google 登录。",
      "メールサービスはこのアドレスに送信できません。アプリ管理者は Supabase でカスタム SMTP を設定する必要があります。Google サインインもお試しください。",
      "이메일 서비스가 이 주소로 메일을 보낼 수 없습니다. 앱 관리자는 Supabase에서 사용자 지정 SMTP를 구성해야 합니다. Google 로그인도 시도해 볼 수 있습니다."
    ],
    "You’re signed in. Your calendar syncs with your account.": [
      "你已登录。日历会与账户同步。",
      "サインインしました。カレンダーはアカウントと同期されます。",
      "로그인되었습니다. 캘린더가 계정과 동기화됩니다."
    ],
    "duplicates skipped": [
      "已跳过重复项",
      "重複をスキップ",
      "중복 항목 건너뜀"
    ],
    "limit reached": [
      "已达到上限",
      "上限に達しました",
      "한도에 도달함"
    ]
  });

  // Additional static labels and runtime messages discovered by the localization audit.
  Object.assign(ASIAN_TRANSLATIONS, {
    "Search dates or events…": [
      "搜索日期或日程…",
      "日付や予定を検索…",
      "날짜 또는 일정 검색…"
    ],
    "At least 6 characters": [
      "至少 6 个字符",
      "6文字以上",
      "6자 이상"
    ],
    "e.g. Dentist tomorrow at 10:07 to 11am, repeat weekly": [
      "例如：明天 10:07 至 11:00 牙医，每周重复",
      "例：明日10:07〜11:00 歯科、毎週繰り返し",
      "예: 내일 10:07~11:00 치과, 매주 반복"
    ],
    "Event name": [
      "日程名称",
      "予定名",
      "일정 이름"
    ],
    "A short description...": [
      "简短描述…",
      "短い説明…",
      "간단한 설명…"
    ],
    "Add a place": [
      "添加地点",
      "場所を追加",
      "장소 추가"
    ],
    "Names, separated by commas": [
      "姓名，使用逗号分隔",
      "名前をカンマで区切って入力",
      "이름을 쉼표로 구분"
    ],
    "Anything else to remember": [
      "其他需要记住的事项",
      "ほかに覚えておくこと",
      "기억할 다른 사항"
    ],
    "What would you like to make time for?": [
      "你想为哪些事情留出时间？",
      "何のために時間を作りたいですか？",
      "어떤 일에 시간을 내고 싶으세요?"
    ],
    "Filter calendars": [
      "筛选日历",
      "カレンダーを絞り込む",
      "캘린더 필터"
    ],
    "Previous year": [
      "上一年",
      "前年",
      "이전 연도"
    ],
    "Previous month": [
      "上个月",
      "前の月",
      "이전 달"
    ],
    "Next month": [
      "下个月",
      "次の月",
      "다음 달"
    ],
    "Next year": [
      "下一年",
      "翌年",
      "다음 연도"
    ],
    "Drag to change view": [
      "拖动以切换视图",
      "ドラッグして表示を切り替え",
      "드래그하여 보기 변경"
    ],
    "Keyboard shortcuts": [
      "键盘快捷键",
      "キーボードショートカット",
      "키보드 단축키"
    ],
    "Create event": [
      "创建日程",
      "予定を作成",
      "일정 만들기"
    ],
    "Search dates or events": [
      "搜索日期或日程",
      "日付や予定を検索",
      "날짜 또는 일정 검색"
    ],
    "Change calendar view. Drag up for month and week, down for full dates.": [
      "更改日历视图。向上拖动可切换到月视图或周视图，向下拖动可查看所有日期。",
      "カレンダー表示を変更します。上にドラッグすると月・週表示、下にドラッグすると全日付表示になります。",
      "캘린더 보기를 변경합니다. 위로 드래그하면 월/주 보기, 아래로 드래그하면 전체 날짜 보기가 됩니다."
    ],
    "Upcoming agenda": [
      "即将到来的日程",
      "今後の予定",
      "다가오는 일정"
    ],
    "Back to settings": [
      "返回设置",
      "設定に戻る",
      "설정으로 돌아가기"
    ],
    "Edit profile": [
      "编辑个人资料",
      "プロフィールを編集",
      "프로필 수정"
    ],
    "Available languages": [
      "可用语言",
      "利用可能な言語",
      "사용 가능한 언어"
    ],
    "Main navigation": [
      "主导航",
      "メインナビゲーション",
      "기본 탐색"
    ],
    "Calex logo": [
      "Calex 标志",
      "Calex ロゴ",
      "Calex 로고"
    ],
    "Home": [
      "主页",
      "ホーム",
      "홈"
    ],
    "Previous mini-calendar month": [
      "迷你日历的上个月",
      "ミニカレンダーの前の月",
      "미니 캘린더 이전 달"
    ],
    "Next mini-calendar month": [
      "迷你日历的下个月",
      "ミニカレンダーの次の月",
      "미니 캘린더 다음 달"
    ],
    "Close": [
      "关闭",
      "閉じる",
      "닫기"
    ],
    "Event title": [
      "日程标题",
      "予定のタイトル",
      "일정 제목"
    ],
    "Event description": [
      "日程描述",
      "予定の説明",
      "일정 설명"
    ],
    "Assistant conversation": [
      "助手对话",
      "アシスタントとの会話",
      "어시스턴트 대화"
    ],
    "Send message": [
      "发送消息",
      "メッセージを送信",
      "메시지 보내기"
    ],
    "Choose a language or use Auto to follow your device's system language.": [
      "选择一种语言，或选择“自动”以跟随设备的系统语言。",
      "言語を選択するか、「自動」を選んでデバイスのシステム言語に従ってください。",
      "언어를 선택하거나 ‘자동’을 사용해 기기의 시스템 언어를 따르세요."
    ],
    "Email or password was not accepted. If you originally used Google, choose Continue with Google: that account may not have a password. Otherwise use password reset or confirm your email.": [
      "电子邮件或密码不正确。如果你最初使用 Google 登录，请选择“使用 Google 继续”；该账户可能没有密码。否则，请重置密码或确认电子邮件地址。",
      "メールアドレスまたはパスワードが正しくありません。最初に Google を利用した場合は「Google で続行」を選択してください。そのアカウントにはパスワードが設定されていない可能性があります。それ以外の場合は、パスワードをリセットするかメールアドレスを確認してください。",
      "이메일 또는 비밀번호가 올바르지 않습니다. 처음에 Google을 사용했다면 ‘Google로 계속’을 선택하세요. 해당 계정에는 비밀번호가 없을 수 있습니다. 그렇지 않으면 비밀번호를 재설정하거나 이메일을 확인하세요."
    ],
    "The authentication service has reached its sending limit. Wait before retrying. The app maintainer may need to configure custom SMTP; Google sign-in is another option.": [
      "身份验证服务已达到邮件发送上限。请稍后重试。应用维护者可能需要配置自定义 SMTP；也可以尝试使用 Google 登录。",
      "認証サービスのメール送信上限に達しました。時間をおいて再試行してください。アプリ管理者がカスタム SMTP を設定する必要がある場合があります。Google サインインも利用できます。",
      "인증 서비스의 이메일 전송 한도에 도달했습니다. 잠시 후 다시 시도하세요. 앱 관리자가 사용자 지정 SMTP를 설정해야 할 수 있으며 Google 로그인도 사용할 수 있습니다."
    ],
    "Confirmation requested. Check your inbox and spam folder. A successful request does not guarantee delivery; if nothing arrives, the maintainer must check Supabase email settings.": [
      "已请求发送确认邮件。请检查收件箱和垃圾邮件文件夹。请求成功并不保证邮件一定送达；如果没有收到，维护者需要检查 Supabase 邮件设置。",
      "確認メールをリクエストしました。受信トレイと迷惑メールフォルダーを確認してください。リクエストが成功しても配信されるとは限りません。届かない場合は、管理者が Supabase のメール設定を確認する必要があります。",
      "확인 이메일을 요청했습니다. 받은편지함과 스팸 폴더를 확인하세요. 요청이 성공해도 이메일이 전달된다는 보장은 없습니다. 이메일이 도착하지 않으면 관리자가 Supabase 이메일 설정을 확인해야 합니다."
    ],
    "Signup request accepted. If this address needs confirmation, check your inbox and spam folder. If you already used Google, choose Continue with Google instead: creating the account again does not set a password or require another confirmation.": [
      "已接受注册请求。如果此地址需要确认，请检查收件箱和垃圾邮件文件夹。如果你之前使用过 Google，请改选“使用 Google 继续”：重新创建账户不会设置密码，也不会要求再次确认。",
      "登録リクエストを受け付けました。このアドレスの確認が必要な場合は、受信トレイと迷惑メールフォルダーを確認してください。以前に Google を利用した場合は「Google で続行」を選択してください。アカウントを再作成してもパスワードは設定されず、再確認も必要ありません。",
      "가입 요청이 접수되었습니다. 이 주소의 확인이 필요하면 받은편지함과 스팸 폴더를 확인하세요. 이미 Google을 사용했다면 ‘Google로 계속’을 선택하세요. 계정을 다시 만들어도 비밀번호가 설정되거나 추가 확인이 필요해지는 것은 아닙니다."
    ],
    "That file is too large to import (5 MB max).": [
      "文件过大，无法导入（最大 5 MB）。",
      "ファイルが大きすぎるためインポートできません（最大5 MB）。",
      "파일이 너무 커서 가져올 수 없습니다(최대 5MB)."
    ],
    "You're offline. Your calendar still works, and changes are saved on this device.": [
      "你当前处于离线状态。日历仍可使用，更改已保存在此设备上。",
      "オフラインです。カレンダーは引き続き使用でき、変更はこのデバイスに保存されています。",
      "오프라인 상태입니다. 캘린더는 계속 사용할 수 있으며 변경 사항은 이 기기에 저장됩니다."
    ],
    "The assistant is taking too long. The request may still incur usage; retry only if needed.": [
      "助手响应时间过长。该请求仍可能产生使用费用；仅在需要时重试。",
      "アシスタントの応答に時間がかかっています。リクエストに利用料金が発生する可能性があるため、必要な場合のみ再試行してください。",
      "어시스턴트 응답이 지연되고 있습니다. 요청에 사용 요금이 발생할 수 있으므로 필요한 경우에만 다시 시도하세요."
    ]
  });

    const ROWS = [
      ["Skip to calendar", "Saltar al calendario", "Passer au calendrier", "Zum Kalender springen"],
      ["YOUR TIME, WELL SPENT", "TU TIEMPO, BIEN APROVECHADO", "VOTRE TEMPS, BIEN UTILISÉ", "DEINE ZEIT, GUT GENUTZT"],
      ["Your day, at a glance", "Tu día de un vistazo", "Votre journée en un coup d’œil", "Dein Tag auf einen Blick"],
      ["On this device", "En este dispositivo", "Sur cet appareil", "Auf diesem Gerät"],
      ["Ask assistant", "Preguntar al asistente", "Interroger l’assistant", "Assistent fragen"],
      ["New event", "Nuevo evento", "Nouvel événement", "Neuer Termin"],
      ["MAKE ROOM FOR WHAT MATTERS", "HAZ ESPACIO PARA LO IMPORTANTE", "FAITES DE LA PLACE POUR L’ESSENTIEL", "SCHAFF PLATZ FÜR DAS WICHTIGE"],
      ["Monday", "Lunes", "Lundi", "Montag"],
      ["Quick add", "Añadir rápido", "Ajout rapide", "Schnell hinzufügen"],
      ["Today", "Hoy", "Aujourd’hui", "Heute"],
      ["Tomorrow", "Mañana", "Demain", "Morgen"],
      ["Coming up", "Próximamente", "À venir", "Demnächst"],
      ["Mon", "Lun", "Lun", "Mo"],
      ["Tue", "Mar", "Mar", "Di"],
      ["Wed", "Mié", "Mer", "Mi"],
      ["Thu", "Jue", "Jeu", "Do"],
      ["Fri", "Vie", "Ven", "Fr"],
      ["Sat", "Sáb", "Sam", "Sa"],
      ["Sun", "Dom", "Dim", "So"],
      ["Selected day", "Día seleccionado", "Jour sélectionné", "Ausgewählter Tag"],
      ["Quick event", "Evento rápido", "Événement rapide", "Schnelltermin"],
      ["Add event", "Añadir evento", "Ajouter un événement", "Termin hinzufügen"],
      ["LOOKING AHEAD", "MIRANDO HACIA DELANTE", "EN PERSPECTIVE", "AUSBLICK"],
      ["Your next 30 days", "Tus próximos 30 días", "Vos 30 prochains jours", "Deine nächsten 30 Tage"],
      ["A little perspective for everything on your calendar.", "Una visión general de todo lo que tienes en el calendario.", "Un peu de recul sur tout ce qui figure à votre calendrier.", "Ein Überblick über alles in deinem Kalender."],
      ["Back to today", "Volver a hoy", "Revenir à aujourd’hui", "Zurück zu heute"],
      ["Settings", "Ajustes", "Paramètres", "Einstellungen"],
      ["Your Calex account", "Tu cuenta de Calex", "Votre compte Calex", "Dein Calex-Konto"],
      ["Sign in or create an account to securely sync your calendar across devices.", "Inicia sesión o crea una cuenta para sincronizar tu calendario de forma segura entre dispositivos.", "Connectez-vous ou créez un compte pour synchroniser votre calendrier en toute sécurité entre vos appareils.", "Melde dich an oder erstelle ein Konto, um deinen Kalender sicher zwischen Geräten zu synchronisieren."],
      ["Not signed in · using this device", "Sin iniciar sesión · usando este dispositivo", "Non connecté · utilisation de cet appareil", "Nicht angemeldet · dieses Gerät wird verwendet"],
      ["Open live Calex to sign in", "Abre Calex en directo para iniciar sesión", "Ouvrez Calex en ligne pour vous connecter", "Öffne Calex live, um dich anzumelden"],
      ["Continue with Google", "Continuar con Google", "Continuer avec Google", "Mit Google fortfahren"],
      ["Already used Google? Choose Google again. Email/password works only after you have set a password for that account.", "¿Ya usaste Google? Vuelve a elegir Google. El correo y la contraseña solo funcionan después de configurar una contraseña para esa cuenta.", "Vous avez déjà utilisé Google ? Choisissez de nouveau Google. L’adresse e-mail et le mot de passe ne fonctionnent qu’après avoir défini un mot de passe pour ce compte.", "Hast du Google bereits verwendet? Wähle erneut Google. E-Mail und Passwort funktionieren erst, nachdem du ein Passwort für dieses Konto festgelegt hast."],
      ["Email", "Correo electrónico", "E-mail", "E-Mail"],
      ["Password", "Contraseña", "Mot de passe", "Passwort"],
      ["Sign in", "Iniciar sesión", "Se connecter", "Anmelden"],
      ["Create account", "Crear cuenta", "Créer un compte", "Konto erstellen"],
      ["Forgot password?", "¿Olvidaste la contraseña?", "Mot de passe oublié ?", "Passwort vergessen?"],
      ["Resend confirmation email", "Reenviar correo de confirmación", "Renvoyer l’e-mail de confirmation", "Bestätigungs-E-Mail erneut senden"],
      ["Sign out", "Cerrar sesión", "Se déconnecter", "Abmelden"],
      ["Choose a password for your confirmed account.", "Elige una contraseña para tu cuenta confirmada.", "Choisissez un mot de passe pour votre compte confirmé.", "Lege ein Passwort für dein bestätigtes Konto fest."],
      ["New password", "Nueva contraseña", "Nouveau mot de passe", "Neues Passwort"],
      ["Confirm password", "Confirmar contraseña", "Confirmer le mot de passe", "Passwort bestätigen"],
      ["Set password", "Establecer contraseña", "Définir le mot de passe", "Passwort festlegen"],
      ["Your calendar syncs only when you are signed in. You can keep using Calex on this device without an account.", "Tu calendario se sincroniza solo cuando has iniciado sesión. Puedes seguir usando Calex en este dispositivo sin una cuenta.", "Votre calendrier se synchronise uniquement lorsque vous êtes connecté. Vous pouvez continuer à utiliser Calex sur cet appareil sans compte.", "Dein Kalender wird nur synchronisiert, wenn du angemeldet bist. Du kannst Calex auf diesem Gerät auch ohne Konto nutzen."],
      ["CALEX PREFERENCES", "PREFERENCIAS DE CALEX", "PRÉFÉRENCES CALEX", "CALEX-EINSTELLUNGEN"],
      ["Make Calex work the way you do.", "Adapta Calex a tu forma de trabajar.", "Adaptez Calex à votre façon de faire.", "Passe Calex an deine Arbeitsweise an."],
      ["Your profile", "Tu perfil", "Votre profil", "Dein Profil"],
      ["Your name", "Tu nombre", "Votre nom", "Dein Name"],
      ["Add your location", "Añade tu ubicación", "Ajoutez votre emplacement", "Standort hinzufügen"],
      ["Edit profile details", "Editar datos del perfil", "Modifier les détails du profil", "Profildetails bearbeiten"],
      ["Display name", "Nombre visible", "Nom affiché", "Anzeigename"],
      ["Location", "Ubicación", "Emplacement", "Standort"],
      ["City or region", "Ciudad o región", "Ville ou région", "Stadt oder Region"],
      ["These details personalize your calendar on this device.", "Estos datos personalizan tu calendario en este dispositivo.", "Ces informations personnalisent votre calendrier sur cet appareil.", "Diese Angaben personalisieren deinen Kalender auf diesem Gerät."],
      ["Save profile", "Guardar perfil", "Enregistrer le profil", "Profil speichern"],
      ["Account & sync", "Cuenta y sincronización", "Compte et synchronisation", "Konto und Synchronisierung"],
      ["Keep your calendar and preferences available across devices.", "Mantén tu calendario y preferencias disponibles en todos tus dispositivos.", "Retrouvez votre calendrier et vos préférences sur tous vos appareils.", "Halte deinen Kalender und deine Einstellungen auf allen Geräten verfügbar."],
      ["Sign in or create account", "Iniciar sesión o crear una cuenta", "Se connecter ou créer un compte", "Anmelden oder Konto erstellen"],
      ["Securely sync your calendar across devices", "Sincroniza tu calendario de forma segura entre dispositivos", "Synchronisez votre calendrier en toute sécurité entre vos appareils", "Synchronisiere deinen Kalender sicher zwischen Geräten"],
      ["Your events stay on this device until you sign in.", "Tus eventos permanecen en este dispositivo hasta que inicies sesión.", "Vos événements restent sur cet appareil jusqu’à votre connexion.", "Deine Termine bleiben auf diesem Gerät, bis du dich anmeldest."],
      ["Sync now", "Sincronizar ahora", "Synchroniser maintenant", "Jetzt synchronisieren"],
      ["Preferences", "Preferencias", "Préférences", "Einstellungen"],
      ["Time zone", "Zona horaria", "Fuseau horaire", "Zeitzone"],
      ["Automatic · device time zone", "Automática · zona horaria del dispositivo", "Automatique · fuseau horaire de l’appareil", "Automatisch · Gerätezeitzone"],
      ["Automatic", "Automático", "Automatique", "Automatisch"],
      ["Choose time zone", "Elegir zona horaria", "Choisir un fuseau horaire", "Zeitzone auswählen"],
      ["Search by city or region", "Buscar por ciudad o región", "Rechercher par ville ou région", "Nach Stadt oder Region suchen"],
      ["Try London, Tokyo, or UTC…", "Prueba Londres, Tokio o UTC…", "Essayez Londres, Tokyo ou UTC…", "Probiere London, Tokio oder UTC…"],
      ["Matching time zones", "Zonas horarias coincidentes", "Fuseaux horaires correspondants", "Passende Zeitzonen"],
      ["Time zone mode", "Modo de zona horaria", "Mode de fuseau horaire", "Zeitzonenmodus"],
      ["Automatic mode follows the time zone configured on this device.", "El modo automático sigue la zona horaria configurada en este dispositivo.", "Le mode automatique suit le fuseau horaire configuré sur cet appareil.", "Der automatische Modus verwendet die auf diesem Gerät eingestellte Zeitzone."],
      ["Save time zone", "Guardar zona horaria", "Enregistrer le fuseau horaire", "Zeitzone speichern"],
      ["Dark appearance", "Apariencia oscura", "Apparence sombre", "Dunkles Erscheinungsbild"],
      ["Adjust the interface for low-light environments", "Adapta la interfaz a entornos con poca luz", "Adaptez l’interface aux environnements peu éclairés", "Passe die Oberfläche an schwach beleuchtete Umgebungen an"],
      ["Language", "Idioma", "Langue", "Sprache"],
      ["Choose your language", "Elige tu idioma", "Choisissez votre langue", "Wähle deine Sprache"],
      ["Manual", "Manual", "Manuel", "Manuell"],
      ["Using", "Usando", "Utilisation de", "Verwendet"],
      ["on", "activada", "activée", "ein"],
      ["off", "desactivada", "désactivée", "aus"],
      ["What's on the horizon", "Lo que viene", "À l’horizon", "Was steht an"],
      ["Help me plan a balanced day.", "Ayúdame a planificar un día equilibrado.", "Aidez-moi à organiser une journée équilibrée.", "Hilf mir, einen ausgewogenen Tag zu planen."],
      ["Find a 60-minute focus window in my upcoming calendar.", "Encuentra un bloque de 60 minutos de concentración en mi calendario.", "Trouve un créneau de concentration de 60 minutes dans mon calendrier.", "Finde einen 60-minütigen Fokusblock in meinem Kalender."],
      ["Schedule a 30-minute weekly planning session tomorrow at 9am.", "Programa mañana a las 9 una sesión semanal de planificación de 30 minutos.", "Planifie demain à 9 h une séance hebdomadaire de planification de 30 minutes.", "Plane morgen um 9 Uhr eine wöchentliche Planungssitzung von 30 Minuten."],
      ["YOU", "TÚ", "VOUS", "DU"],
      ["event today", "evento hoy", "événement aujourd’hui", "Termin heute"],
      ["Timed", "Con hora", "Avec horaire", "Mit Uhrzeit"],
      ["Repeating", "Recurrente", "Récurrent", "Wiederkehrend"],
      ["Display language", "Idioma de la interfaz", "Langue de l’interface", "Anzeigesprache"],
      ["Your interface language is saved with your preferences.", "El idioma de la interfaz se guarda con tus preferencias.", "La langue de l’interface est enregistrée avec vos préférences.", "Die Anzeigesprache wird zusammen mit deinen Einstellungen gespeichert."],
      ["Your data", "Tus datos", "Vos données", "Deine Daten"],
      ["Export calendar", "Exportar calendario", "Exporter le calendrier", "Kalender exportieren"],
      ["Download a portable .ics calendar file", "Descarga un archivo de calendario .ics portátil", "Télécharger un fichier calendrier .ics portable", "Eine portable .ics-Kalenderdatei herunterladen"],
      ["Import calendar", "Importar calendario", "Importer un calendrier", "Kalender importieren"],
      ["Add events from an .ics file (Google, Outlook, Apple)", "Añade eventos desde un archivo .ics (Google, Outlook, Apple)", "Ajouter des événements depuis un fichier .ics (Google, Outlook, Apple)", "Termine aus einer .ics-Datei hinzufügen (Google, Outlook, Apple)"],
      ["When signed out, your calendar is stored on this device. Signing in enables account-based sync. You can export a copy of your events at any time.", "Cuando cierras sesión, tu calendario se guarda en este dispositivo. Iniciar sesión permite sincronizar con tu cuenta. Puedes exportar una copia de tus eventos cuando quieras.", "Lorsque vous êtes déconnecté, votre calendrier est stocké sur cet appareil. La connexion active la synchronisation du compte. Vous pouvez exporter une copie de vos événements à tout moment.", "Wenn du abgemeldet bist, wird dein Kalender auf diesem Gerät gespeichert. Durch die Anmeldung wird die kontobasierte Synchronisierung aktiviert. Du kannst jederzeit eine Kopie deiner Termine exportieren."],
      ["About & legal", "Acerca de y legal", "À propos et mentions légales", "Info und Rechtliches"],
      ["About Calex", "Über Calex", "À propos de Calex", "Über Calex"],
      ["What Calex does and how to get help", "Qué hace Calex y cómo obtener ayuda", "Ce que fait Calex et comment obtenir de l’aide", "Was Calex macht und wie du Hilfe bekommst"],
      ["Terms of service", "Términos del servicio", "Conditions d’utilisation", "Nutzungsbedingungen"],
      ["Rules and limitations for using Calex", "Reglas y límites para usar Calex", "Règles et limites d’utilisation de Calex", "Regeln und Einschränkungen für die Nutzung von Calex"],
      ["Privacy policy", "Política de privacidad", "Politique de confidentialité", "Datenschutzerklärung"],
      ["How calendar and account data are handled", "Cómo se gestionan los datos del calendario y de la cuenta", "Comment les données du calendrier et du compte sont traitées", "Wie Kalender- und Kontodaten verarbeitet werden"],
      ["ABOUT", "ACERCA DE", "À PROPOS", "ÜBER"],
      ["A calm, straightforward calendar for keeping track of your days.", "Un calendario sencillo y tranquilo para organizar tus días.", "Un calendrier simple et serein pour organiser vos journées.", "Ein ruhiger, unkomplizierter Kalender, um deine Tage im Blick zu behalten."],
      ["What you can do", "Qué puedes hacer", "Ce que vous pouvez faire", "Was du tun kannst"],
      ["Create and manage events, browse dates, search your calendar, set a preferred time zone, and export events as an iCalendar (.ics) file.", "Crea y gestiona eventos, consulta fechas, busca en tu calendario, configura una zona horaria preferida y exporta eventos como archivo iCalendar (.ics).", "Créez et gérez des événements, parcourez les dates, recherchez dans votre calendrier, choisissez un fuseau horaire et exportez des événements au format iCalendar (.ics).", "Erstelle und verwalte Termine, durchsuche Daten, suche im Kalender, lege eine bevorzugte Zeitzone fest und exportiere Termine als iCalendar-Datei (.ics)."],
      ["Your calendar, your choice", "Tu calendario, tu elección", "Votre calendrier, votre choix", "Dein Kalender, deine Wahl"],
      ["You can use Calex on one device without signing in. Signing in enables account-based synchronisation where configured. You can export a copy of your events from Settings.", "Puedes usar Calex en un dispositivo sin iniciar sesión. Cuando está configurada, la sesión permite sincronizar con tu cuenta. Puedes exportar una copia de tus eventos desde Ajustes.", "Vous pouvez utiliser Calex sur un seul appareil sans vous connecter. Lorsque la synchronisation est configurée, la connexion permet la synchronisation du compte. Vous pouvez exporter une copie de vos événements depuis les paramètres.", "Du kannst Calex auf einem Gerät ohne Anmeldung verwenden. Bei entsprechender Konfiguration ermöglicht die Anmeldung die kontobasierte Synchronisierung. Unter Einstellungen kannst du eine Kopie deiner Termine exportieren."],
      ["Help and feedback", "Ayuda y comentarios", "Aide et commentaires", "Hilfe und Feedback"],
      ["Report a bug or request an improvement through the", "Informa de un error o solicita una mejora mediante el", "Signalez un bug ou demandez une amélioration via le", "Melde einen Fehler oder schlage eine Verbesserung vor über den"],
      ["Calex GitHub issue tracker", "seguimiento de incidencias de Calex en GitHub", "suivi des problèmes Calex sur GitHub", "Calex-Issue-Tracker auf GitHub"],
      [". Do not include passwords, private event details, or other sensitive information in a public issue.", ". No incluyas contraseñas, detalles privados de eventos ni otra información sensible en una incidencia pública.", ". N’incluez pas de mots de passe, de détails privés d’événements ni d’autres informations sensibles dans un ticket public.", ". Gib in öffentlichen Issues keine Passwörter, privaten Termindetails oder sonstigen sensiblen Informationen an."],
      ["LEGAL", "LEGAL", "MENTIONS LÉGALES", "RECHTLICHES"],
      ["These terms explain the basic conditions for using Calex. By using the app, you agree to these terms. If you do not agree, stop using the app.", "Estas condiciones explican las reglas básicas para usar Calex. Al utilizar la aplicación, aceptas estas condiciones. Si no estás de acuerdo, deja de usarla.", "Ces conditions expliquent les règles de base d’utilisation de Calex. En utilisant l’application, vous les acceptez. Si vous n’êtes pas d’accord, cessez d’utiliser l’application.", "Diese Bedingungen erläutern die grundlegenden Regeln für die Nutzung von Calex. Mit der Nutzung der App stimmst du ihnen zu. Wenn du nicht zustimmst, nutze die App nicht weiter."],
      ["1. The service", "1. El servicio", "1. Le service", "1. Der Dienst"],
      ["Calex provides calendar and event-management features, including local storage, optional account sign-in and synchronisation, time-zone preferences, and calendar export. Features may change, be unavailable, or be discontinued.", "Calex ofrece funciones de calendario y gestión de eventos, incluido almacenamiento local, inicio de sesión y sincronización opcionales, preferencias de zona horaria y exportación del calendario. Las funciones pueden cambiar, no estar disponibles o dejar de ofrecerse.", "Calex propose des fonctions de calendrier et de gestion d’événements, notamment le stockage local, la connexion et la synchronisation facultatives, les préférences de fuseau horaire et l’exportation du calendrier. Les fonctions peuvent évoluer, être indisponibles ou être supprimées.", "Calex bietet Kalender- und Terminverwaltungsfunktionen, darunter lokale Speicherung, optionale Kontoanmeldung und Synchronisierung, Zeitzoneneinstellungen und Kalenderexport. Funktionen können geändert werden, nicht verfügbar sein oder eingestellt werden."],
      ["2. Your information and responsibilities", "2. Tu información y responsabilidades", "2. Vos informations et responsabilités", "2. Deine Informationen und Pflichten"],
      ["You are responsible for the accuracy of the events you enter and for keeping your account credentials secure. Do not use Calex as the only copy of important information. Export or otherwise back up events you cannot afford to lose.", "Eres responsable de que los eventos introducidos sean correctos y de proteger las credenciales de tu cuenta. No uses Calex como única copia de información importante. Exporta o respalda de otra forma los eventos que no puedes permitirte perder.", "Vous êtes responsable de l’exactitude des événements saisis et de la sécurité de vos identifiants. N’utilisez pas Calex comme unique copie d’informations importantes. Exportez ou sauvegardez autrement les événements que vous ne pouvez pas vous permettre de perdre.", "Du bist für die Richtigkeit deiner Termine und den Schutz deiner Zugangsdaten verantwortlich. Verwende Calex nicht als einzige Kopie wichtiger Informationen. Exportiere oder sichere Termine anderweitig, deren Verlust du dir nicht leisten kannst."],
      ["3. Acceptable use", "3. Uso aceptable", "3. Utilisation acceptable", "3. Zulässige Nutzung"],
      ["Do not misuse the service, attempt to gain unauthorised access, interfere with its operation, or use it in a way that violates applicable law or another person's rights.", "No utilices mal el servicio, no intentes obtener acceso no autorizado, no interfieras con su funcionamiento ni lo uses de una forma que infrinja la ley aplicable o los derechos de otra persona.", "N’utilisez pas le service de manière abusive, ne tentez pas d’obtenir un accès non autorisé, ne perturbez pas son fonctionnement et ne l’utilisez pas d’une manière qui enfreint la loi applicable ou les droits d’autrui.", "Missbrauche den Dienst nicht, versuche nicht, unbefugt Zugriff zu erhalten, störe seinen Betrieb nicht und nutze ihn nicht auf eine Weise, die geltendes Recht oder die Rechte anderer verletzt."],
      ["4. Availability and data loss", "4. Disponibilidad y pérdida de datos", "4. Disponibilité et perte de données", "4. Verfügbarkeit und Datenverlust"],
      ["Calex is provided on an “as available” basis. We do not guarantee uninterrupted service, error-free operation, successful synchronisation, or permanent preservation of data. Device failure, browser settings, clearing site data, account issues, or service outages may affect access to events.", "Calex se proporciona según disponibilidad. No garantizamos un servicio ininterrumpido, un funcionamiento sin errores, una sincronización correcta ni la conservación permanente de los datos. Los fallos del dispositivo, la configuración del navegador, la eliminación de datos del sitio, los problemas de cuenta o las interrupciones del servicio pueden afectar al acceso a los eventos.", "Calex est fourni selon sa disponibilité. Nous ne garantissons ni un service ininterrompu, ni un fonctionnement sans erreur, ni une synchronisation réussie, ni la conservation permanente des données. Une panne de l’appareil, les paramètres du navigateur, l’effacement des données du site, des problèmes de compte ou des interruptions peuvent affecter l’accès aux événements.", "Calex wird nach Verfügbarkeit bereitgestellt. Wir garantieren keinen unterbrechungsfreien Dienst, fehlerfreien Betrieb, erfolgreiche Synchronisierung oder dauerhafte Datenspeicherung. Geräteausfälle, Browsereinstellungen, das Löschen von Websitedaten, Kontoprobleme oder Dienstausfälle können den Zugriff auf Termine beeinträchtigen."],
      ["5. No professional advice or emergency service", "5. Sin asesoramiento profesional ni servicio de emergencias", "5. Aucun conseil professionnel ni service d’urgence", "5. Keine professionelle Beratung oder Notfallhilfe"],
      ["Calex is a general-purpose organisational tool. It is not a medical, legal, financial, or emergency service. You are responsible for checking event details, reminders, dates, and times that matter to you.", "Calex es una herramienta de organización general. No es un servicio médico, jurídico, financiero ni de emergencias. Eres responsable de comprobar los detalles de los eventos, recordatorios, fechas y horas importantes para ti.", "Calex est un outil d’organisation généraliste. Ce n’est pas un service médical, juridique, financier ou d’urgence. Il vous appartient de vérifier les détails des événements, rappels, dates et heures importants pour vous.", "Calex ist ein allgemeines Organisationswerkzeug. Es ist kein medizinischer, rechtlicher, finanzieller oder Notfalldienst. Du bist dafür verantwortlich, wichtige Termindetails, Erinnerungen, Daten und Uhrzeiten zu prüfen."],
      ["6. Limitation of liability", "6. Limitación de responsabilidad", "6. Limitation de responsabilité", "6. Haftungsbeschränkung"],
      ["To the extent permitted by applicable law, Calex is not liable for indirect or consequential loss, missed appointments, or loss of calendar data arising from use of the service. Nothing in these terms excludes rights or liability that cannot lawfully be excluded.", "En la medida permitida por la ley aplicable, Calex no responde por pérdidas indirectas o consecuenciales, citas perdidas ni pérdida de datos del calendario derivadas del uso del servicio. Estas condiciones no excluyen derechos ni responsabilidades que legalmente no puedan excluirse.", "Dans la mesure permise par la loi applicable, Calex n’est pas responsable des pertes indirectes ou consécutives, des rendez-vous manqués ou de la perte de données du calendrier résultant de l’utilisation du service. Rien dans ces conditions n’exclut les droits ou responsabilités qui ne peuvent légalement être exclus.", "Soweit gesetzlich zulässig, haftet Calex nicht für indirekte oder Folgeschäden, verpasste Termine oder Kalenderdatenverluste infolge der Nutzung des Dienstes. Diese Bedingungen schließen keine Rechte oder Haftung aus, die gesetzlich nicht ausgeschlossen werden dürfen."],
      ["7. Changes to these terms", "7. Cambios en estas condiciones", "7. Modifications des conditions", "7. Änderungen dieser Bedingungen"],
      ["These terms may be updated as the app changes. The effective date above indicates the latest published version. Continued use after an update means you accept the revised terms where the law permits.", "Estas condiciones pueden actualizarse a medida que cambie la aplicación. La fecha de entrada en vigor indicada arriba corresponde a la última versión publicada. Si sigues usando la aplicación tras una actualización, aceptas las condiciones revisadas cuando la ley lo permita.", "Ces conditions peuvent être mises à jour à mesure que l’application évolue. La date d’entrée en vigueur ci-dessus indique la dernière version publiée. La poursuite de l’utilisation après une mise à jour vaut acceptation des conditions révisées lorsque la loi le permet.", "Diese Bedingungen können mit der Weiterentwicklung der App aktualisiert werden. Das oben angegebene Datum kennzeichnet die neueste veröffentlichte Version. Wenn du die App nach einer Aktualisierung weiter nutzt, akzeptierst du die überarbeiteten Bedingungen, soweit gesetzlich zulässig."],
      ["8. Contact", "8. Contacto", "8. Contact", "8. Kontakt"],
      ["For support or questions about these terms, use the", "Para obtener ayuda o consultar estas condiciones, utiliza el", "Pour obtenir de l’aide ou poser une question sur ces conditions, utilisez le", "Bei Supportanfragen oder Fragen zu diesen Bedingungen nutze den"],
      [". Do not post confidential information publicly.", ". No publiques información confidencial.", ". Ne publiez pas d’informations confidentielles.", ". Veröffentliche keine vertraulichen Informationen."],
      ["This policy describes how the current Calex app handles information. The precise handling of account data can depend on your sign-in and synchronisation configuration.", "Esta política describe cómo la versión actual de Calex trata la información. El tratamiento exacto de los datos de la cuenta puede depender de tu configuración de inicio de sesión y sincronización.", "Cette politique décrit la manière dont la version actuelle de Calex traite les informations. Le traitement précis des données du compte peut dépendre de votre configuration de connexion et de synchronisation.", "Diese Richtlinie beschreibt, wie die aktuelle Calex-App mit Informationen umgeht. Die genaue Verarbeitung von Kontodaten kann von deinen Einstellungen für Anmeldung und Synchronisierung abhängen."],
      ["1. Information you enter", "1. Información que introduces", "1. Informations que vous saisissez", "1. Angaben, die du eingibst"],
      ["Calendar events may include titles, descriptions, dates, times, locations, attendees or people, repeat settings, and notes. Profile preferences may include a display name, location, time-zone choice, and appearance preference. Avoid entering information you do not want stored in your calendar.", "Los eventos del calendario pueden incluir títulos, descripciones, fechas, horas, ubicaciones, asistentes, opciones de repetición y notas. Las preferencias del perfil pueden incluir nombre visible, ubicación, zona horaria y apariencia. No introduzcas información que no quieras guardar en el calendario.", "Les événements peuvent inclure des titres, descriptions, dates, heures, lieux, participants, paramètres de répétition et notes. Les préférences du profil peuvent inclure un nom affiché, un emplacement, un fuseau horaire et l’apparence. Évitez de saisir des informations que vous ne souhaitez pas stocker dans votre calendrier.", "Kalendertermine können Titel, Beschreibungen, Daten, Uhrzeiten, Orte, Teilnehmende, Wiederholungseinstellungen und Notizen enthalten. Profileinstellungen können Anzeigename, Standort, Zeitzone und Erscheinungsbild umfassen. Gib keine Informationen ein, die nicht in deinem Kalender gespeichert werden sollen."],
      ["2. Local storage", "2. Almacenamiento local", "2. Stockage local", "2. Lokale Speicherung"],
      ["When you use Calex while signed out, events and preferences are saved in your browser's local storage on that device. They are not automatically available on another device. Clearing browser/site data, using private browsing, or losing access to the device may remove locally stored information. Use the export feature to keep a separate copy.", "Cuando usas Calex sin iniciar sesión, los eventos y las preferencias se guardan en el almacenamiento local del navegador de ese dispositivo. No estarán disponibles automáticamente en otro dispositivo. Borrar los datos del navegador o del sitio, usar navegación privada o perder acceso al dispositivo puede eliminar la información guardada. Usa la función de exportación para conservar una copia.", "Lorsque vous utilisez Calex sans être connecté, les événements et préférences sont enregistrés dans le stockage local du navigateur sur cet appareil. Ils ne sont pas automatiquement disponibles sur un autre appareil. L’effacement des données du navigateur ou du site, la navigation privée ou la perte d’accès à l’appareil peut supprimer ces informations. Utilisez l’exportation pour conserver une copie séparée.", "Wenn du Calex abgemeldet verwendest, werden Termine und Einstellungen im lokalen Speicher des Browsers auf diesem Gerät abgelegt. Sie sind nicht automatisch auf anderen Geräten verfügbar. Das Löschen von Browser- oder Websitedaten, privates Surfen oder der Verlust des Gerätezugriffs kann lokal gespeicherte Informationen entfernen. Verwende den Export, um eine separate Kopie aufzubewahren."],
      ["3. Account and synchronisation", "3. Cuenta y sincronización", "3. Compte et synchronisation", "3. Konto und Synchronisierung"],
      ["If you sign in and synchronisation is enabled, Calex uses Supabase authentication and its configured database service to authenticate your account and synchronise calendar events and preferences. This means relevant data may be transmitted to and stored by that service. Account-based data is associated with your account, subject to the app's database access policies and service configuration.", "Si inicias sesión y está habilitada la sincronización, Calex usa la autenticación de Supabase y su base de datos configurada para autenticar tu cuenta y sincronizar eventos y preferencias. Esto significa que los datos pertinentes pueden transmitirse y almacenarse en ese servicio. Los datos de la cuenta se asocian a tu cuenta, sujetos a las políticas de acceso a la base de datos y a la configuración del servicio.", "Si vous vous connectez et que la synchronisation est activée, Calex utilise l’authentification Supabase et son service de base de données configuré pour authentifier votre compte et synchroniser les événements et préférences. Les données concernées peuvent ainsi être transmises à ce service et y être stockées. Les données du compte sont associées à votre compte, selon les règles d’accès à la base de données et la configuration du service.", "Wenn du dich anmeldest und die Synchronisierung aktiviert ist, verwendet Calex die Supabase-Authentifizierung und den konfigurierten Datenbankdienst, um dein Konto zu authentifizieren und Termine sowie Einstellungen zu synchronisieren. Entsprechende Daten können dadurch an diesen Dienst übertragen und dort gespeichert werden. Kontobezogene Daten werden gemäß den Datenbankzugriffsrichtlinien und der Dienstkonfiguration deinem Konto zugeordnet."],
      ["4. Time zone and device information", "4. Zona horaria e información del dispositivo", "4. Fuseau horaire et informations sur l’appareil", "4. Zeitzone und Geräteinformationen"],
      ["Automatic time-zone mode reads the time-zone identifier provided by your browser or device. Calex uses it to display your preference; the app does not need your precise GPS location for this feature. If you enter a location in your profile or an event, that text is stored as part of the relevant data.", "El modo automático lee el identificador de zona horaria que proporciona tu navegador o dispositivo. Calex lo usa para mostrar tu preferencia; esta función no necesita tu ubicación GPS precisa. Si introduces una ubicación en tu perfil o en un evento, ese texto se guarda como parte de los datos correspondientes.", "Le mode automatique lit l’identifiant de fuseau horaire fourni par votre navigateur ou appareil. Calex l’utilise pour afficher votre préférence ; cette fonction n’a pas besoin de votre position GPS précise. Si vous indiquez un lieu dans votre profil ou un événement, ce texte est stocké avec les données concernées.", "Der automatische Zeitzonenmodus liest die von Browser oder Gerät bereitgestellte Zeitzonenkennung. Calex verwendet sie zur Anzeige deiner Einstellung; dafür ist kein genauer GPS-Standort erforderlich. Wenn du einen Standort im Profil oder in einem Termin angibst, wird dieser Text als Teil der entsprechenden Daten gespeichert."],
      ["5. Cookies, analytics, and third parties", "5. Cookies, análisis y terceros", "5. Cookies, analyses et tiers", "5. Cookies, Analysen und Dritte"],
      ["Calex uses browser storage for app data and may load the Supabase client library from a content delivery network. The app's authentication and synchronisation features rely on Supabase when configured. Third-party infrastructure may process technical information under its own terms and policies; consult those policies for details.", "Calex usa el almacenamiento del navegador para los datos de la aplicación y puede cargar la biblioteca cliente de Supabase desde una red de distribución de contenido. Las funciones de autenticación y sincronización dependen de Supabase cuando están configuradas. La infraestructura de terceros puede tratar información técnica conforme a sus propias condiciones y políticas.", "Calex utilise le stockage du navigateur pour les données de l’application et peut charger la bibliothèque cliente Supabase depuis un réseau de diffusion de contenu. Les fonctions d’authentification et de synchronisation reposent sur Supabase lorsqu’elles sont configurées. Des infrastructures tierces peuvent traiter des informations techniques selon leurs propres conditions et politiques.", "Calex nutzt den Browserspeicher für App-Daten und kann die Supabase-Clientbibliothek über ein Content Delivery Network laden. Authentifizierung und Synchronisierung basieren bei entsprechender Konfiguration auf Supabase. Drittanbieter-Infrastruktur kann technische Informationen gemäß ihren eigenen Bedingungen und Richtlinien verarbeiten."],
      ["Optional AI assistant", "Asistente de IA opcional", "Assistant IA facultatif", "Optionaler KI-Assistent"],
      ["The assistant loads Puter.js only when you enable it. Messages you submit are sent to Puter and its AI provider. Calendar context is off by default; turning it on shares upcoming event titles, dates, times, and locations for the next 14 days. Descriptions, notes, and people are not included. Chat history is kept only for this session. Puter authentication, usage allowances, and charges are separate from Calex. Review", "El asistente carga Puter.js solo cuando lo activas. Los mensajes que envías se comparten con Puter y su proveedor de IA. El contexto del calendario está desactivado por defecto; al activarlo, se comparten los títulos, fechas, horas y ubicaciones de los eventos de los próximos 14 días. No se incluyen descripciones, notas ni personas. El historial del chat solo se conserva durante esta sesión. La autenticación, los límites de uso y los cargos de Puter son independientes de Calex. Consulta", "L’assistant ne charge Puter.js que lorsque vous l’activez. Les messages envoyés sont transmis à Puter et à son fournisseur d’IA. Le contexte du calendrier est désactivé par défaut ; son activation partage les titres, dates, heures et lieux des événements des 14 prochains jours. Les descriptions, notes et personnes ne sont pas incluses. L’historique du chat est conservé uniquement pour cette session. L’authentification, les quotas et les frais Puter sont indépendants de Calex. Consultez", "Der Assistent lädt Puter.js erst, wenn du ihn aktivierst. Deine Nachrichten werden an Puter und dessen KI-Anbieter gesendet. Der Kalenderkontext ist standardmäßig deaktiviert; bei Aktivierung werden Titel, Daten, Uhrzeiten und Orte der Termine der nächsten 14 Tage geteilt. Beschreibungen, Notizen und Personen werden nicht einbezogen. Der Chatverlauf bleibt nur für diese Sitzung erhalten. Puter-Authentifizierung, Nutzungslimits und Gebühren sind unabhängig von Calex. Lies"],
      ["Puter's privacy policy", "la política de privacidad de Puter", "la politique de confidentialité de Puter", "die Datenschutzerklärung von Puter"],
      ["before sharing sensitive information. AI suggestions are not saved until you review and confirm them in the event editor.", "antes de compartir información sensible. Las sugerencias de IA no se guardan hasta que las revisas y confirmas en el editor de eventos.", "avant de partager des informations sensibles. Les suggestions de l’IA ne sont pas enregistrées tant que vous ne les avez pas examinées et confirmées dans l’éditeur d’événements.", "bevor du sensible Informationen teilst. KI-Vorschläge werden erst gespeichert, wenn du sie im Termin-Editor prüfst und bestätigst."],
      ["6. Sharing and disclosure", "6. Compartición y divulgación", "6. Partage et divulgation", "6. Weitergabe und Offenlegung"],
      ["Calex does not provide a public calendar-sharing feature in the current interface. Data may be processed by the infrastructure providers required to operate sign-in and synchronisation, or disclosed where required by law. Anyone with access to your unlocked device or account may be able to access your calendar.", "La interfaz actual de Calex no ofrece una función para compartir calendarios públicamente. Los datos pueden ser tratados por los proveedores necesarios para el inicio de sesión y la sincronización, o divulgarse cuando lo exija la ley. Quien tenga acceso a tu dispositivo desbloqueado o a tu cuenta podría acceder al calendario.", "L’interface actuelle de Calex ne propose pas de partage public du calendrier. Les données peuvent être traitées par les fournisseurs nécessaires à la connexion et à la synchronisation, ou divulguées si la loi l’exige. Toute personne ayant accès à votre appareil déverrouillé ou à votre compte peut potentiellement accéder à votre calendrier.", "Die aktuelle Calex-Oberfläche bietet keine öffentliche Kalenderfreigabe. Daten können von den für Anmeldung und Synchronisierung benötigten Infrastrukturanbietern verarbeitet oder gesetzlich erforderlichenfalls offengelegt werden. Wer Zugriff auf dein entsperrtes Gerät oder Konto hat, kann möglicherweise auch deinen Kalender einsehen."],
      ["7. Retention and deletion", "7. Conservación y eliminación", "7. Conservation et suppression", "7. Aufbewahrung und Löschung"],
      ["Local data remains in your browser until you remove it or the browser clears it. Signed-in data may remain in the configured cloud database until deleted through supported app or account-management processes or by the service operator. Export your events before clearing local data or changing accounts. If you need account data deleted, contact the app maintainer through the link below; do not include private event details in a public request.", "Los datos locales permanecen en el navegador hasta que los elimines o el navegador los borre. Los datos de una cuenta pueden permanecer en la base de datos en la nube hasta que se eliminen mediante las funciones disponibles, la gestión de cuenta o el operador del servicio. Exporta tus eventos antes de borrar datos locales o cambiar de cuenta. Para solicitar la eliminación de datos de cuenta, contacta con el responsable de la aplicación mediante el enlace inferior; no incluyas detalles privados en una solicitud pública.", "Les données locales restent dans votre navigateur jusqu’à leur suppression par vous ou par le navigateur. Les données liées à un compte peuvent rester dans la base cloud configurée jusqu’à leur suppression via les fonctions prises en charge, la gestion du compte ou l’opérateur du service. Exportez vos événements avant d’effacer les données locales ou de changer de compte. Pour demander la suppression des données de compte, contactez le responsable via le lien ci-dessous sans inclure de détails privés dans une demande publique.", "Lokale Daten bleiben im Browser, bis du sie entfernst oder der Browser sie löscht. Angemeldete Daten können in der konfigurierten Cloud-Datenbank verbleiben, bis sie über unterstützte App-Funktionen, die Kontoverwaltung oder den Dienstbetreiber gelöscht werden. Exportiere Termine, bevor du lokale Daten löschst oder das Konto wechselst. Wende dich zur Löschung von Kontodaten über den Link unten an den App-Betreiber; gib in einer öffentlichen Anfrage keine privaten Termindetails an."],
      ["8. Your choices and security", "8. Tus opciones y seguridad", "8. Vos choix et votre sécurité", "8. Deine Möglichkeiten und Sicherheit"],
      ["You can use Calex without signing in, choose whether to enable account synchronisation, export your calendar, and avoid entering unnecessary personal information. No online service can guarantee absolute security, so use a strong unique password and protect access to your device.", "Puedes usar Calex sin iniciar sesión, decidir si activas la sincronización de cuenta, exportar tu calendario y evitar introducir datos personales innecesarios. Ningún servicio en línea puede garantizar una seguridad absoluta; utiliza una contraseña única y robusta y protege el acceso a tu dispositivo.", "Vous pouvez utiliser Calex sans vous connecter, choisir d’activer ou non la synchronisation du compte, exporter votre calendrier et éviter de saisir des données personnelles inutiles. Aucun service en ligne ne peut garantir une sécurité absolue : utilisez un mot de passe unique et robuste et protégez l’accès à votre appareil.", "Du kannst Calex ohne Anmeldung nutzen, die Kontosynchronisierung aktivieren oder deaktivieren, deinen Kalender exportieren und unnötige persönliche Angaben vermeiden. Kein Online-Dienst kann absolute Sicherheit garantieren. Verwende ein starkes, einzigartiges Passwort und schütze den Zugriff auf dein Gerät."],
      ["9. Children and sensitive information", "9. Menores e información sensible", "9. Enfants et informations sensibles", "9. Kinder und sensible Informationen"],
      ["Do not use Calex to store highly sensitive information unless you have assessed that it is appropriate for your circumstances and the service configuration. If you are using Calex under a parent's or organisation's guidance, follow their applicable rules.", "No uses Calex para guardar información muy sensible salvo que hayas evaluado que es adecuado para tus circunstancias y la configuración del servicio. Si utilizas Calex bajo la orientación de un progenitor o una organización, sigue las normas correspondientes.", "N’utilisez pas Calex pour stocker des informations très sensibles sans avoir évalué si cela convient à votre situation et à la configuration du service. Si vous utilisez Calex sous la supervision d’un parent ou d’une organisation, respectez leurs règles applicables.", "Speichere keine hochsensiblen Informationen in Calex, es sei denn, du hast geprüft, ob dies zu deinen Umständen und der Dienstkonfiguration passt. Wenn du Calex unter Anleitung eines Elternteils oder einer Organisation verwendest, befolge deren geltende Regeln."],
      ["10. Policy changes and contact", "10. Cambios en la política y contacto", "10. Modifications de la politique et contact", "10. Änderungen der Richtlinie und Kontakt"],
      ["This policy may change as Calex evolves. For privacy questions or deletion requests, contact the maintainer through the", "Esta política puede cambiar a medida que evolucione Calex. Para dudas sobre privacidad o solicitudes de eliminación, contacta con el responsable mediante el", "Cette politique peut évoluer avec Calex. Pour toute question relative à la confidentialité ou demande de suppression, contactez le responsable via le", "Diese Richtlinie kann sich mit Calex weiterentwickeln. Bei Datenschutzfragen oder Löschanfragen kontaktiere die verantwortliche Person über den"],
      [". Public issues are visible to others, so request a private contact route before sharing personal data.", ". Las incidencias públicas son visibles para otras personas; solicita un canal de contacto privado antes de compartir datos personales.", ". Les tickets publics sont visibles par d’autres personnes ; demandez un moyen de contact privé avant de partager des données personnelles.", ". Öffentliche Issues sind für andere sichtbar. Bitte um einen privaten Kontaktweg, bevor du personenbezogene Daten weitergibst."],
      ["WORKSPACE", "ESPACIO DE TRABAJO", "ESPACE DE TRAVAIL", "ARBEITSBEREICH"],
      ["Overview", "Resumen", "Vue d’ensemble", "Übersicht"],
      ["Calendar", "Calendario", "Calendrier", "Kalender"],
      ["Agenda", "Agenda", "Agenda", "Agenda"],
      ["MY CALENDARS", "MIS CALENDARIOS", "MES CALENDRIERS", "MEINE KALENDER"],
      ["Personal", "Personal", "Personnel", "Persönlich"],
      ["Work & study", "Trabajo y estudio", "Travail et études", "Arbeit und Studium"],
      ["Wellbeing", "Bienestar", "Bien-être", "Wohlbefinden"],
      ["A little help planning", "Un poco de ayuda para planificar", "Un peu d’aide pour planifier", "Etwas Planungshilfe"],
      ["Meet your Calex assistant", "Conoce al asistente de Calex", "Découvrez l’assistant Calex", "Lerne den Calex-Assistenten kennen"],
      ["Install Calex", "Instalar Calex", "Installer Calex", "Calex installieren"],
      ["Made for your everyday", "Hecho para tu día a día", "Pensé pour votre quotidien", "Für deinen Alltag gemacht"],
      ["Saved on this device", "Guardado en este dispositivo", "Enregistré sur cet appareil", "Auf diesem Gerät gespeichert"],
      ["Describe your event", "Describe tu evento", "Décrivez votre événement", "Beschreibe deinen Termin"],
      ["Try “Team meeting tomorrow 10:07 to 20:00”, “Gym every Monday at 6pm”, or “Lunch on 14 June at noon”. We’ll interpret common dates, times and repeats.", "Prueba «Reunión de equipo mañana de 10:07 a 20:00», «Gimnasio cada lunes a las 18:00» o «Comida el 14 de junio al mediodía». Interpretaremos fechas, horas y repeticiones habituales.", "Essayez « Réunion d’équipe demain de 10:07 à 20:00 », « Sport chaque lundi à 18 h » ou « Déjeuner le 14 juin à midi ». Nous interprétons les dates, heures et répétitions courantes.", "Probiere „Teammeeting morgen 10:07 bis 20:00“, „Fitness jeden Montag um 18 Uhr“ oder „Mittagessen am 14. Juni um 12 Uhr“. Häufige Datums-, Zeit- und Wiederholungsangaben werden erkannt."],
      ["Start typing to see the preview...", "Empieza a escribir para ver la vista previa...", "Commencez à écrire pour voir l’aperçu...", "Beginne zu tippen, um eine Vorschau zu sehen …"],
      ["Date *", "Fecha *", "Date *", "Datum *"],
      ["Start time", "Hora de inicio", "Heure de début", "Startzeit"],
      ["End time", "Hora de finalización", "Heure de fin", "Endzeit"],
      ["Repeat", "Repetir", "Répéter", "Wiederholen"],
      ["Never", "Nunca", "Jamais", "Nie"],
      ["Every day", "Todos los días", "Tous les jours", "Jeden Tag"],
      ["Every week", "Todas las semanas", "Chaque semaine", "Jede Woche"],
      ["Every fortnight", "Cada dos semanas", "Toutes les deux semaines", "Alle zwei Wochen"],
      ["Every month", "Cada mes", "Chaque mois", "Jeden Monat"],
      ["Every year", "Cada año", "Chaque année", "Jedes Jahr"],
      ["People", "Personas", "Personnes", "Personen"],
      ["Notes", "Notas", "Notes", "Notizen"],
      ["Save event", "Guardar evento", "Enregistrer l’événement", "Termin speichern"],
      ["A LITTLE CLARITY", "UN POCO DE CLARIDAD", "UN PEU DE CLARTÉ", "EIN WENIG KLARHEIT"],
      ["Calex assistant", "Asistente de Calex", "Assistant Calex", "Calex-Assistent"],
      ["Less juggling.", "Menos malabares.", "Moins de choses à jongler.", "Weniger Jonglieren."],
      ["More breathing room.", "Más espacio para respirar.", "Plus d’espace pour respirer.", "Mehr Luft zum Durchatmen."],
      ["Plan your day, find a focus window, or turn an idea into an event.", "Planifica tu día, encuentra un momento para concentrarte o convierte una idea en un evento.", "Planifiez votre journée, trouvez un créneau de concentration ou transformez une idée en événement.", "Plane deinen Tag, finde Zeit für konzentriertes Arbeiten oder mache aus einer Idee einen Termin."],
      ["Powered by Puter. Your own account handles AI access and any usage costs. Only messages you send are shared unless you enable calendar context.", "Funciona con Puter. Tu cuenta gestiona el acceso a la IA y los posibles costes de uso. Solo se comparten los mensajes que envías, salvo que actives el contexto del calendario.", "Propulsé par Puter. Votre compte gère l’accès à l’IA et les éventuels frais d’utilisation. Seuls les messages que vous envoyez sont partagés, sauf si vous activez le contexte du calendrier.", "Betrieben mit Puter. Dein eigenes Konto verwaltet den KI-Zugriff und mögliche Nutzungskosten. Nur deine gesendeten Nachrichten werden geteilt, sofern du den Kalenderkontext nicht aktivierst."],
      ["Enable Puter assistant", "Activar el asistente de Puter", "Activer l’assistant Puter", "Puter-Assistent aktivieren"],
      ["Plan my day", "Planificar mi día", "Planifier ma journée", "Meinen Tag planen"],
      ["Find focus time", "Encontrar tiempo de concentración", "Trouver du temps de concentration", "Konzentrationszeit finden"],
      ["Create an event", "Crear un evento", "Créer un événement", "Termin erstellen"],
      ["Share next 14 days (titles, times, locations)", "Compartir los próximos 14 días (títulos, horas y ubicaciones)", "Partager les 14 prochains jours (titres, heures et lieux)", "Nächste 14 Tage teilen (Titel, Zeiten, Orte)"],
      ["Message the assistant", "Escribe al asistente", "Envoyer un message à l’assistant", "Nachricht an den Assistenten"],
      ["AI can make mistakes. Review dates and times before saving.", "La IA puede cometer errores. Revisa las fechas y horas antes de guardar.", "L’IA peut se tromper. Vérifiez les dates et heures avant d’enregistrer.", "KI kann Fehler machen. Prüfe Daten und Uhrzeiten vor dem Speichern."],
      ["Make time for shortcuts", "Haz tiempo para los atajos", "Gagnez du temps avec les raccourcis", "Zeit sparen mit Tastenkürzeln"],
      ["Search calendar", "Buscar en el calendario", "Rechercher dans le calendrier", "Kalender durchsuchen"],
      ["Go to today", "Ir a hoy", "Aller à aujourd’hui", "Zu heute wechseln"],
      ["Month / week / year", "Mes / semana / año", "Mois / semaine / année", "Monat / Woche / Jahr"],
      ["Close dialog", "Cerrar cuadro de diálogo", "Fermer la boîte de dialogue", "Dialog schließen"],
      ["My calendars", "Mis calendarios", "Mes calendriers", "Meine Kalender"],
      ["Quick event", "Evento rápido", "Événement rapide", "Schnelltermin"],
      ["Full dates", "Fechas completas", "Toutes les dates", "Alle Daten"],
      ["Month", "Mes", "Mois", "Monat"],
      ["Week", "Semana", "Semaine", "Woche"],
      ["View", "Vista", "Vue", "Ansicht"],
      ["view", "vista", "vue", "Ansicht"],
      ["Events", "Eventos", "Événements", "Termine"],
      ["event", "evento", "événement", "Termin"],
      ["events", "eventos", "événements", "Termine"],
      ["To do", "Pendiente", "À faire", "Zu erledigen"],
      ["Completed", "Completado", "Terminé", "Erledigt"],
      ["Nothing planned for this day.", "Nada previsto para este día.", "Rien de prévu pour cette journée.", "Für diesen Tag ist nichts geplant."],
      ["Completed events will appear here.", "Los eventos completados aparecerán aquí.", "Les événements terminés apparaîtront ici.", "Abgeschlossene Termine erscheinen hier."],
      ["No events planned for this day.", "No hay eventos previstos para este día.", "Aucun événement prévu pour cette journée.", "Für diesen Tag sind keine Termine geplant."],
      ["All day", "Todo el día", "Toute la journée", "Ganztägig"],
      ["Until", "Hasta", "Jusqu’à", "Bis"],
      ["With", "Con", "Avec", "Mit"],
      ["Repeat daily", "Repetir a diario", "Répéter chaque jour", "Täglich wiederholen"],
      ["Repeats daily", "Se repite a diario", "Répétition quotidienne", "Wiederholt sich täglich"],
      ["Repeats weekly", "Se repite cada semana", "Répétition hebdomadaire", "Wiederholt sich wöchentlich"],
      ["Repeats monthly", "Se repite cada mes", "Répétition mensuelle", "Wiederholt sich monatlich"],
      ["Repeats yearly", "Se repite cada año", "Répétition annuelle", "Wiederholt sich jährlich"],
      ["Delete event", "Eliminar evento", "Supprimer l’événement", "Termin löschen"],
      ["Edit event", "Editar evento", "Modifier l’événement", "Termin bearbeiten"],
      ["No matching events or dates.", "No hay eventos ni fechas coincidentes.", "Aucun événement ou date correspondant.", "Keine passenden Termine oder Daten."],
      ["No matching time zones. Try a city or region name.", "No se encontraron zonas horarias. Prueba con una ciudad o región.", "Aucun fuseau horaire correspondant. Essayez une ville ou une région.", "Keine passende Zeitzone gefunden. Versuche einen Stadt- oder Regionsnamen."],
      ["Choose a time zone from the search results.", "Elige una zona horaria de los resultados de búsqueda.", "Choisissez un fuseau horaire dans les résultats.", "Wähle eine Zeitzone aus den Suchergebnissen."],
      ["Time zone preference saved", "Preferencia de zona horaria guardada", "Préférence de fuseau horaire enregistrée", "Zeitzoneneinstellung gespeichert"],
      ["Profile saved", "Perfil guardado", "Profil enregistré", "Profil gespeichert"],
      ["Could not save settings in this browser.", "No se pudieron guardar los ajustes en este navegador.", "Impossible d’enregistrer les paramètres dans ce navigateur.", "Einstellungen konnten in diesem Browser nicht gespeichert werden."],
      ["Appearance changed for this session, but could not be saved.", "La apariencia cambió durante esta sesión, pero no se pudo guardar.", "L’apparence a changé pour cette session, mais n’a pas pu être enregistrée.", "Das Erscheinungsbild wurde für diese Sitzung geändert, konnte aber nicht gespeichert werden."],
      ["End time must be later than start time.", "La hora de finalización debe ser posterior a la hora de inicio.", "L’heure de fin doit être postérieure à l’heure de début.", "Die Endzeit muss nach der Startzeit liegen."],
      ["Add an event title.", "Añade un título al evento.", "Ajoutez un titre à l’événement.", "Gib einen Termintitel ein."],
      ["Add a valid event name and date.", "Añade un nombre de evento y una fecha válidos.", "Ajoutez un nom d’événement et une date valides.", "Gib einen gültigen Terminnamen und ein Datum ein."],
      ["Describe your event first.", "Describe primero tu evento.", "Décrivez d’abord votre événement.", "Beschreibe zuerst deinen Termin."],
      ["Choose a valid event date.", "Elige una fecha de evento válida.", "Choisissez une date d’événement valide.", "Wähle ein gültiges Termindatum."],
      ["Event added", "Evento añadido", "Événement ajouté", "Termin hinzugefügt"],
      ["Event updated", "Evento actualizado", "Événement mis à jour", "Termin aktualisiert"],
      ["Event deleted", "Evento eliminado", "Événement supprimé", "Termin gelöscht"],
      ["Event restored", "Evento restaurado", "Événement restauré", "Termin wiederhergestellt"],
      ["No events found in that file.", "No se encontraron eventos en ese archivo.", "Aucun événement trouvé dans ce fichier.", "In dieser Datei wurden keine Termine gefunden."],
      ["Nothing new to import.", "No hay nada nuevo que importar.", "Aucun nouvel élément à importer.", "Nichts Neues zum Importieren."],
      ["Couldn’t read that file. Is it a valid .ics calendar?", "No se pudo leer el archivo. ¿Es un calendario .ics válido?", "Impossible de lire ce fichier. S’agit-il d’un calendrier .ics valide ?", "Die Datei konnte nicht gelesen werden. Ist es ein gültiger .ics-Kalender?"],
      ["Couldn’t sync. Your changes are saved on this device.", "No se pudo sincronizar. Tus cambios están guardados en este dispositivo.", "Synchronisation impossible. Vos modifications sont enregistrées sur cet appareil.", "Synchronisierung fehlgeschlagen. Deine Änderungen sind auf diesem Gerät gespeichert."],
      ["Couldn’t sync just now. Your changes are safe on this device. Tap Sync now to retry.", "No se pudo sincronizar ahora. Tus cambios están a salvo en este dispositivo. Pulsa Sincronizar ahora para volver a intentarlo.", "Synchronisation momentanément impossible. Vos modifications restent sur cet appareil. Appuyez sur Synchroniser maintenant pour réessayer.", "Synchronisierung gerade nicht möglich. Deine Änderungen sind auf diesem Gerät sicher. Tippe auf „Jetzt synchronisieren“, um es erneut zu versuchen."],
      ["Your calendar is up to date across devices.", "Tu calendario está actualizado en todos tus dispositivos.", "Votre calendrier est à jour sur tous vos appareils.", "Dein Kalender ist auf allen Geräten aktuell."],
      ["You’re offline. Changes are saved here and will sync when you’re back online.", "Estás sin conexión. Los cambios se guardan aquí y se sincronizarán cuando vuelvas a conectarte.", "Vous êtes hors ligne. Les modifications sont enregistrées ici et seront synchronisées à votre reconnexion.", "Du bist offline. Änderungen werden hier gespeichert und bei erneuter Verbindung synchronisiert."],
      ["Browser storage is unavailable. Changes may not persist after closing this page.", "El almacenamiento del navegador no está disponible. Los cambios podrían perderse al cerrar esta página.", "Le stockage du navigateur est indisponible. Les modifications risquent de ne pas être conservées après la fermeture de cette page.", "Der Browserspeicher ist nicht verfügbar. Änderungen bleiben nach dem Schließen dieser Seite möglicherweise nicht erhalten."],
      ["Browser storage is unavailable. Events last only for this session. Export a backup from Settings.", "El almacenamiento del navegador no está disponible. Los eventos solo durarán esta sesión. Exporta una copia de seguridad desde Ajustes.", "Le stockage du navigateur est indisponible. Les événements ne durent que pendant cette session. Exportez une sauvegarde depuis les paramètres.", "Der Browserspeicher ist nicht verfügbar. Termine bleiben nur für diese Sitzung erhalten. Exportiere eine Sicherung über Einstellungen."],
      ["Events · chronological", "Eventos · cronológico", "Événements · chronologique", "Termine · chronologisch"],
      ["Make yourself at home", "Ponte a gusto", "Faites comme chez vous", "Mach es dir bequem"],
      ["A little space for everything", "Un pequeño espacio para todo", "Un espace pour chaque chose", "Ein wenig Platz für alles"],
      ["Your privacy matters", "Tu privacidad importa", "Votre confidentialité compte", "Deine Privatsphäre ist wichtig"],
      ["Terms of service", "Términos del servicio", "Conditions d’utilisation", "Nutzungsbedingungen"],
      ["Authentication could not load. Check your connection, then refresh Calex.", "No se pudo cargar la autenticación. Comprueba la conexión y actualiza Calex.", "Impossible de charger l’authentification. Vérifiez votre connexion puis actualisez Calex.", "Authentifizierung konnte nicht geladen werden. Prüfe deine Verbindung und lade Calex neu."],
      ["Authentication library is unavailable. Refresh and try again.", "La biblioteca de autenticación no está disponible. Actualiza e inténtalo de nuevo.", "La bibliothèque d’authentification est indisponible. Actualisez puis réessayez.", "Die Authentifizierungsbibliothek ist nicht verfügbar. Lade die Seite neu und versuche es erneut."],
      ["Could not load authentication. Refresh and try again.", "No se pudo cargar la autenticación. Actualiza e inténtalo de nuevo.", "Impossible de charger l’authentification. Actualisez puis réessayez.", "Authentifizierung konnte nicht geladen werden. Lade die Seite neu und versuche es erneut."],
      ["Could not contact authentication. Check your connection and try again.", "No se pudo contactar con la autenticación. Comprueba tu conexión e inténtalo de nuevo.", "Impossible de contacter le service d’authentification. Vérifiez votre connexion et réessayez.", "Authentifizierungsdienst nicht erreichbar. Prüfe deine Verbindung und versuche es erneut."],
      ["Could not request a confirmation email.", "No se pudo solicitar el correo de confirmación.", "Impossible de demander l’e-mail de confirmation.", "Bestätigungs-E-Mail konnte nicht angefordert werden."],
      ["Could not request a reset. Please try again.", "No se pudo solicitar el restablecimiento. Inténtalo de nuevo.", "Impossible de demander la réinitialisation. Veuillez réessayer.", "Zurücksetzen konnte nicht angefordert werden. Bitte versuche es erneut."],
      ["Could not restore your sign-in session. Please try again.", "No se pudo restaurar tu sesión. Inténtalo de nuevo.", "Impossible de restaurer votre session. Veuillez réessayer.", "Deine Anmeldesitzung konnte nicht wiederhergestellt werden. Bitte versuche es erneut."],
      ["Could not set a password.", "No se pudo establecer la contraseña.", "Impossible de définir le mot de passe.", "Passwort konnte nicht festgelegt werden."],
      ["Authentication could not complete. Check your connection and try again.", "No se pudo completar la autenticación. Comprueba tu conexión e inténtalo de nuevo.", "L’authentification n’a pas abouti. Vérifiez votre connexion et réessayez.", "Authentifizierung konnte nicht abgeschlossen werden. Prüfe deine Verbindung und versuche es erneut."],
      ["Add a valid event name and date.", "Añade un nombre de evento y una fecha válidos.", "Ajoutez un nom d’événement et une date valides.", "Gib einen gültigen Terminnamen und ein Datum ein."],
      ["Enter your email first.", "Introduce primero tu correo electrónico.", "Saisissez d’abord votre adresse e-mail.", "Gib zuerst deine E-Mail-Adresse ein."],
      ["Enter a valid email address before requesting a confirmation.", "Introduce una dirección de correo válida antes de solicitar la confirmación.", "Saisissez une adresse e-mail valide avant de demander une confirmation.", "Gib eine gültige E-Mail-Adresse ein, bevor du eine Bestätigung anforderst."],
      ["Enter a valid email and password of at least 6 characters.", "Introduce un correo válido y una contraseña de al menos 6 caracteres.", "Saisissez une adresse e-mail valide et un mot de passe d’au moins 6 caractères.", "Gib eine gültige E-Mail-Adresse und ein Passwort mit mindestens 6 Zeichen ein."],
      ["Google sign-in could not start.", "No se pudo iniciar el acceso con Google.", "La connexion Google n’a pas pu démarrer.", "Die Google-Anmeldung konnte nicht gestartet werden."],
      ["Google sign-in must run outside this embedded preview. Open the live Calex site using the link below, then choose Continue with Google.", "El inicio de sesión con Google debe realizarse fuera de esta vista previa integrada. Abre Calex en directo con el enlace siguiente y elige Continuar con Google.", "La connexion Google doit être effectuée en dehors de cet aperçu intégré. Ouvrez Calex en ligne via le lien ci-dessous, puis choisissez Continuer avec Google.", "Die Google-Anmeldung muss außerhalb dieser eingebetteten Vorschau erfolgen. Öffne Calex über den Link unten und wähle dann „Mit Google fortfahren“."],
      ["Could not load authentication. Refresh and try again.", "No se pudo cargar la autenticación. Actualiza e inténtalo de nuevo.", "Impossible de charger l’authentification. Actualisez puis réessayez.", "Authentifizierung konnte nicht geladen werden. Lade die Seite neu und versuche es erneut."],
      ["Authentication library is unavailable. Refresh and try again.", "La biblioteca de autenticación no está disponible. Actualiza e inténtalo de nuevo.", "La bibliothèque d’authentification est indisponible. Actualisez puis réessayez.", "Die Authentifizierungsbibliothek ist nicht verfügbar. Lade die Seite neu und versuche es erneut."],
      ["Passwords do not match.", "Las contraseñas no coinciden.", "Les mots de passe ne correspondent pas.", "Die Passwörter stimmen nicht überein."],
      ["Your email is not confirmed yet. Check your inbox and spam folder, or request a new confirmation below.", "Tu correo electrónico aún no está confirmado. Revisa la bandeja de entrada y el correo no deseado, o solicita una nueva confirmación abajo.", "Votre adresse e-mail n’est pas encore confirmée. Vérifiez votre boîte de réception et les courriers indésirables, ou demandez une nouvelle confirmation ci-dessous.", "Deine E-Mail-Adresse ist noch nicht bestätigt. Prüfe Posteingang und Spam-Ordner oder fordere unten eine neue Bestätigung an."],
      ["Password reset requested. If an account exists for this email, check your inbox and spam folder.", "Se solicitó restablecer la contraseña. Si existe una cuenta con este correo, revisa la bandeja de entrada y el correo no deseado.", "La réinitialisation du mot de passe a été demandée. Si un compte existe pour cette adresse, vérifiez votre boîte de réception et les courriers indésirables.", "Das Zurücksetzen des Passworts wurde angefordert. Falls ein Konto für diese E-Mail-Adresse besteht, prüfe Posteingang und Spam-Ordner."],
      ["Password set. You can now use email/password or Google for this account.", "Contraseña configurada. Ahora puedes usar el correo y la contraseña o Google para esta cuenta.", "Mot de passe défini. Vous pouvez maintenant utiliser l’e-mail et le mot de passe ou Google pour ce compte.", "Passwort festgelegt. Du kannst dich bei diesem Konto jetzt mit E-Mail/Passwort oder Google anmelden."],
      ["Signed in. Your calendar is connected.", "Has iniciado sesión. Tu calendario está conectado.", "Vous êtes connecté. Votre calendrier est relié.", "Du bist angemeldet. Dein Kalender ist verbunden."],
      ["Signed out", "Sesión cerrada", "Déconnecté", "Abgemeldet"],
      ["Sign-in request completed", "Solicitud de inicio de sesión completada", "Demande de connexion terminée", "Anmeldeanforderung abgeschlossen"],
      ["Account created", "Cuenta creada", "Compte créé", "Konto erstellt"],
      ["Account connected", "Cuenta conectada", "Compte connecté", "Konto verbunden"],
      ["Account sync enabled", "Sincronización de cuenta activada", "Synchronisation du compte activée", "Kontosynchronisierung aktiviert"],
      ["Sync needs attention", "La sincronización requiere atención", "La synchronisation nécessite votre attention", "Synchronisierung erfordert Aufmerksamkeit"],
      ["Offline · saved locally", "Sin conexión · guardado localmente", "Hors ligne · enregistré localement", "Offline · lokal gespeichert"],
      ["Offline, still organised", "Sin conexión, pero organizado", "Hors ligne, toujours organisé", "Offline, weiterhin organisiert"],
      ["Saved on this device", "Guardado en este dispositivo", "Enregistré sur cet appareil", "Auf diesem Gerät gespeichert"],
      ["Storage unavailable · export a backup", "Almacenamiento no disponible · exporta una copia", "Stockage indisponible · exportez une sauvegarde", "Speicher nicht verfügbar · Sicherung exportieren"],
      ["Loading Puter…", "Cargando Puter…", "Chargement de Puter…", "Puter wird geladen …"],
      ["Sign in to Puter", "Iniciar sesión en Puter", "Se connecter à Puter", "Bei Puter anmelden"],
      ["Ready. Click Sign in to open Puter's account window.", "Listo. Haz clic en Iniciar sesión para abrir la ventana de cuenta de Puter.", "Prêt. Cliquez sur Se connecter pour ouvrir la fenêtre du compte Puter.", "Bereit. Klicke auf „Anmelden“, um das Puter-Kontofenster zu öffnen."],
      ["Sign-in did not finish. Please try again.", "El inicio de sesión no se completó. Inténtalo de nuevo.", "La connexion n’a pas abouti. Veuillez réessayer.", "Die Anmeldung wurde nicht abgeschlossen. Bitte versuche es erneut."],
      ["The assistant needs an internet connection. Your calendar still works offline.", "El asistente necesita conexión a Internet. Tu calendario sigue funcionando sin conexión.", "L’assistant nécessite une connexion Internet. Votre calendrier reste utilisable hors ligne.", "Der Assistent benötigt eine Internetverbindung. Dein Kalender funktioniert weiterhin offline."],
      ["Enable the assistant and sign in to Puter first.", "Activa el asistente e inicia sesión en Puter primero.", "Activez d’abord l’assistant et connectez-vous à Puter.", "Aktiviere zuerst den Assistenten und melde dich bei Puter an."],
      ["You're offline. Reconnect to use the assistant.", "No tienes conexión. Vuelve a conectarte para usar el asistente.", "Vous êtes hors ligne. Reconnectez-vous pour utiliser l’assistant.", "Du bist offline. Stelle die Verbindung wieder her, um den Assistenten zu nutzen."],
      ["Making a little room for thought…", "Haciendo un poco de espacio para pensar…", "Un peu d’espace pour réfléchir…", "Ein wenig Raum zum Nachdenken …"],
      ["Please try rephrasing that.", "Intenta expresarlo de otra manera.", "Essayez de reformuler.", "Versuche, es anders zu formulieren."],
      ["Review event", "Revisar evento", "Vérifier l’événement", "Termin prüfen"],
      ["The suggested event had invalid details. Ask the assistant to correct them.", "El evento sugerido contiene datos no válidos. Pide al asistente que los corrija.", "L’événement suggéré contient des informations invalides. Demandez à l’assistant de les corriger.", "Der vorgeschlagene Termin enthält ungültige Angaben. Bitte den Assistenten, sie zu korrigieren."],
      ["We couldn't finish that request.", "No pudimos completar esa solicitud.", "Nous n’avons pas pu terminer cette demande.", "Diese Anfrage konnte nicht abgeschlossen werden."],
      ["The assistant returned an unreadable response. Please try again.", "El asistente devolvió una respuesta ilegible. Inténtalo de nuevo.", "L’assistant a renvoyé une réponse illisible. Veuillez réessayer.", "Der Assistent hat eine unlesbare Antwort zurückgegeben. Bitte versuche es erneut."],
      ["Calendar context not shared. Do not invent existing events or availability.", "No se comparte el contexto del calendario. No inventes eventos ni disponibilidad.", "Le contexte du calendrier n’est pas partagé. N’inventez pas d’événements ni de disponibilités.", "Kalenderkontext wird nicht geteilt. Erfinde keine vorhandenen Termine oder Verfügbarkeiten."],
      ["Calendar context removed. Future requests start with a fresh conversation.", "Se ha eliminado el contexto del calendario. Las próximas solicitudes empezarán una conversación nueva.", "Le contexte du calendrier a été supprimé. Les prochaines demandes commenceront une nouvelle conversation.", "Der Kalenderkontext wurde entfernt. Künftige Anfragen beginnen mit einer neuen Unterhaltung."],
      ["Upcoming titles, dates, times, and locations will be shared with your next message.", "Los títulos, fechas, horas y ubicaciones próximos se compartirán con tu siguiente mensaje.", "Les titres, dates, heures et lieux à venir seront partagés avec votre prochain message.", "Künftige Titel, Daten, Uhrzeiten und Orte werden mit deiner nächsten Nachricht geteilt."],
      ["Nothing planned", "Nada previsto", "Rien de prévu", "Nichts geplant"],
      ["A little breathing room.", "Un poco de tranquilidad.", "Un peu de répit.", "Ein wenig Freiraum."],
      ["Your day is yours to shape. Add something worth making time for.", "Tu día es tuyo. Añade algo a lo que merezca la pena dedicar tiempo.", "Votre journée vous appartient. Ajoutez quelque chose qui mérite d’y consacrer du temps.", "Dein Tag gehört dir. Füge etwas hinzu, wofür sich Zeit lohnt."],
      ["Add your first event", "Añadir tu primer evento", "Ajouter votre premier événement", "Ersten Termin hinzufügen"],
      ["The next chapter is unwritten.", "El próximo capítulo está por escribir.", "Le prochain chapitre reste à écrire.", "Das nächste Kapitel ist noch ungeschrieben."],
      ["Add an event to start shaping the days ahead.", "Añade un evento para empezar a dar forma a los próximos días.", "Ajoutez un événement pour commencer à façonner les jours à venir.", "Füge einen Termin hinzu, um die kommenden Tage zu gestalten."],
      ["New event", "Nuevo evento", "Nouvel événement", "Neuer Termin"],
      ["No matching events or dates.", "No hay eventos ni fechas coincidentes.", "Aucun événement ou date correspondant.", "Keine passenden Termine oder Daten."],
      ["A valid time is required.", "Se necesita una hora válida.", "Une heure valide est requise.", "Eine gültige Uhrzeit ist erforderlich."],
      ["This follows your device setting automatically.", "Esto sigue automáticamente la configuración de tu dispositivo.", "Ce réglage suit automatiquement celui de votre appareil.", "Diese Einstellung folgt automatisch der Geräteeinstellung."],
      ["Selected:", "Seleccionado:", "Sélectionné :", "Ausgewählt:"],
      ["Save to apply.", "Guarda para aplicar.", "Enregistrez pour appliquer.", "Zum Anwenden speichern."],
      ["Existing event dates and times are not converted.", "Las fechas y horas de los eventos existentes no se convierten.", "Les dates et heures des événements existants ne sont pas converties.", "Bestehende Termindaten und -zeiten werden nicht umgerechnet."],
      ["No events planned for this day.", "No hay eventos previstos para este día.", "Aucun événement prévu pour cette journée.", "Für diesen Tag sind keine Termine geplant."],
      ["The assistant could not load. Check your connection and retry.", "No se pudo cargar el asistente. Comprueba tu conexión e inténtalo de nuevo.", "L’assistant n’a pas pu se charger. Vérifiez votre connexion et réessayez.", "Der Assistent konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut."],
      ["Could not load Puter. Check your connection and retry.", "No se pudo cargar Puter. Comprueba tu conexión e inténtalo de nuevo.", "Impossible de charger Puter. Vérifiez votre connexion et réessayez.", "Puter konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut."],
      ["Puter could not complete this request. Check your account access and try again.", "Puter no pudo completar esta solicitud. Comprueba el acceso a tu cuenta e inténtalo de nuevo.", "Puter n’a pas pu terminer cette demande. Vérifiez l’accès à votre compte et réessayez.", "Puter konnte die Anfrage nicht abschließen. Prüfe deinen Kontozugriff und versuche es erneut."],
      ["Puter could not initialise.", "Puter no pudo iniciarse.", "Puter n’a pas pu s’initialiser.", "Puter konnte nicht initialisiert werden."],
      ["Puter took too long to load. Check your connection and retry.", "Puter tardó demasiado en cargar. Comprueba tu conexión e inténtalo de nuevo.", "Le chargement de Puter a pris trop de temps. Vérifiez votre connexion et réessayez.", "Puter hat zu lange zum Laden gebraucht. Prüfe deine Verbindung und versuche es erneut."],
      ["Switch to dark appearance", "Cambiar a la apariencia oscura", "Passer à l’apparence sombre", "Zum dunklen Erscheinungsbild wechseln"],
      ["Switch to light appearance", "Cambiar a la apariencia clara", "Passer à l’apparence claire", "Zum hellen Erscheinungsbild wechseln"],
      ["Toggle appearance", "Cambiar apariencia", "Changer l’apparence", "Erscheinungsbild umschalten"],
      ["Close assistant", "Cerrar asistente", "Fermer l’assistant", "Assistent schließen"],
      ["Close filters", "Cerrar filtros", "Fermer les filtres", "Filter schließen"],
      ["Close shortcuts", "Cerrar atajos", "Fermer les raccourcis", "Tastenkürzel schließen"],
      ["Matching time zones", "Zonas horarias coincidentes", "Fuseaux horaires correspondants", "Passende Zeitzonen"],
      ["Search calendar", "Buscar en el calendario", "Rechercher dans le calendrier", "Kalender durchsuchen"],
      ["Hide details", "Ocultar detalles", "Masquer les détails", "Details ausblenden"],
      ["Show details", "Mostrar detalles", "Afficher les détails", "Details anzeigen"],
      ["Calendar: Month view", "Calendario: vista mensual", "Calendrier : vue mensuelle", "Kalender: Monatsansicht"],
      ["Calendar: Week view", "Calendario: vista semanal", "Calendrier : vue hebdomadaire", "Kalender: Wochenansicht"],
      ["Calendar: Full dates view", "Calendario: vista de todas las fechas", "Calendrier : vue toutes les dates", "Kalender: Gesamtansicht"],
      ["Full dates view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.", "Vista de todas las fechas. Arrastra hacia arriba para mes y semana, hacia abajo para todas las fechas. Atajos: M, W, Y.", "Vue toutes les dates. Faites glisser vers le haut pour le mois et la semaine, vers le bas pour toutes les dates. Raccourcis : M, W, Y.", "Gesamtansicht. Ziehe nach oben für Monat und Woche, nach unten für alle Daten. Tastenkürzel: M, W, Y."],
      ["Month view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.", "Vista mensual. Arrastra hacia arriba para mes y semana, hacia abajo para todas las fechas. Atajos: M, W, Y.", "Vue mensuelle. Faites glisser vers le haut pour le mois et la semaine, vers le bas pour toutes les dates. Raccourcis : M, W, Y.", "Monatsansicht. Ziehe nach oben für Monat und Woche, nach unten für alle Daten. Tastenkürzel: M, W, Y."],
      ["Week view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.", "Vista semanal. Arrastra hacia arriba para mes y semana, hacia abajo para todas las fechas. Atajos: M, W, Y.", "Vue hebdomadaire. Faites glisser vers le haut pour le mois et la semaine, vers le bas pour toutes les dates. Raccourcis : M, W, Y.", "Wochenansicht. Ziehe nach oben für Monat und Woche, nach unten für alle Daten. Tastenkürzel: M, W, Y."],
      ["Mark", "Marcar", "Marquer", "Markieren"],
      ["completed", "completado", "terminé", "erledigt"],
      ["Edit", "Editar", "Modifier", "Bearbeiten"],
      ["until", "hasta", "jusqu’à", "bis"],
      ["of your day", "de tu día", "de votre journée", "deines Tages"],
      ["of", "de", "sur", "von"],
      ["events today", "eventos hoy", "événements aujourd’hui", "Termine heute"],
      ["ON THE CALENDAR", "EN EL CALENDARIO", "AU CALENDRIER", "IM KALENDER"],
      ["TIME COMMITTED", "TIEMPO COMPROMETIDO", "TEMPS PLANIFIÉ", "GEBUNDENE ZEIT"],
      ["A LITTLE PROGRESS", "UN POCO DE PROGRESO", "UN PEU DE PROGRÈS", "EIN KLEINER FORTSCHRITT"],
      ["Nothing new to import.", "No hay nada nuevo que importar.", "Aucun nouvel élément à importer.", "Nichts Neues zum Importieren."],
      ["Please choose a language.", "Elige un idioma.", "Veuillez choisir une langue.", "Bitte wähle eine Sprache aus."],
      ["Reset link accepted. Choose a new password below.", "Enlace de restablecimiento aceptado. Elige una nueva contraseña abajo.", "Lien de réinitialisation accepté. Choisissez un nouveau mot de passe ci-dessous.", "Link zum Zurücksetzen akzeptiert. Lege unten ein neues Passwort fest."],
      ["Manage your account and sign-out options", "Gestiona tu cuenta y las opciones para cerrar sesión", "Gérez votre compte et les options de déconnexion", "Verwalte dein Konto und die Abmeldeoptionen"],
      ["Rule-based preview", "Vista previa basada en reglas", "Aperçu basé sur des règles", "Regelbasierte Vorschau"],
      ["Supabase could not send the email. The app maintainer needs to check SMTP settings and Auth delivery logs.", "Supabase no pudo enviar el correo. La persona responsable de la aplicación debe revisar la configuración SMTP y los registros de entrega de Auth.", "Supabase n’a pas pu envoyer l’e-mail. Le responsable de l’application doit vérifier la configuration SMTP et les journaux de livraison Auth.", "Supabase konnte die E-Mail nicht senden. Die betreuende Person muss die SMTP-Einstellungen und die Auth-Zustellprotokolle prüfen."],
      ["The email service cannot send to this address. The app maintainer must configure custom SMTP in Supabase. You can also try Google sign-in.", "El servicio de correo no puede enviar mensajes a esta dirección. La persona responsable debe configurar SMTP personalizado en Supabase. También puedes probar el acceso con Google.", "Le service de messagerie ne peut pas envoyer à cette adresse. Le responsable doit configurer un SMTP personnalisé dans Supabase. Vous pouvez aussi essayer la connexion Google.", "Der E-Mail-Dienst kann an diese Adresse nicht senden. Die betreuende Person muss benutzerdefiniertes SMTP in Supabase einrichten. Du kannst auch die Google-Anmeldung versuchen."],
      ["You’re signed in. Your calendar syncs with your account.", "Has iniciado sesión. Tu calendario se sincroniza con tu cuenta.", "Vous êtes connecté. Votre calendrier se synchronise avec votre compte.", "Du bist angemeldet. Dein Kalender wird mit deinem Konto synchronisiert."],
      ["duplicates skipped", "duplicados omitidos", "doublons ignorés", "Duplikate übersprungen"],
      ["limit reached", "límite alcanzado", "limite atteinte", "Limit erreicht"],
    ];

    ROWS.push(
      ["Auto · System settings", "Automático · configuración del sistema", "Auto · paramètres système", "Auto · Systemeinstellungen"],
      ["Auto", "Automático", "Auto", "Auto"],
      ["System settings", "Configuración del sistema", "Paramètres système", "Systemeinstellungen"],
      ["Search languages", "Buscar idiomas", "Rechercher des langues", "Sprachen suchen"],
      ["No matching languages.", "No hay idiomas coincidentes.", "Aucune langue correspondante.", "Keine passenden Sprachen."],
    );

  ROWS.push(
    ["Search dates or events…","Buscar fechas o eventos…","Rechercher des dates ou des événements…","Daten oder Termine suchen…"],
    ["At least 6 characters","Al menos 6 caracteres","Au moins 6 caractères","Mindestens 6 Zeichen"],
    ["e.g. Dentist tomorrow at 10:07 to 11am, repeat weekly","p. ej., dentista mañana de 10:07 a 11:00, repetir cada semana","ex. : dentiste demain de 10 h 07 à 11 h, chaque semaine","z. B. morgen Zahnarzt von 10:07 bis 11:00, wöchentlich"],
    ["Event name","Nombre del evento","Nom de l’événement","Terminname"],
    ["A short description...","Una breve descripción…","Une courte description…","Eine kurze Beschreibung…"],
    ["Add a place","Añadir un lugar","Ajouter un lieu","Ort hinzufügen"],
    ["Names, separated by commas","Nombres, separados por comas","Noms, séparés par des virgules","Namen, durch Kommas getrennt"],
    ["Anything else to remember","Algo más que recordar","Autre chose à retenir","Sonst noch etwas zu beachten"],
    ["What would you like to make time for?","¿A qué te gustaría dedicar tiempo?","À quoi aimeriez-vous consacrer du temps ?","Wofür möchtest du dir Zeit nehmen?"],
    ["Filter calendars","Filtrar calendarios","Filtrer les calendriers","Kalender filtern"],
    ["Previous year","Año anterior","Année précédente","Vorheriges Jahr"],
    ["Previous month","Mes anterior","Mois précédent","Vorheriger Monat"],
    ["Next month","Mes siguiente","Mois suivant","Nächster Monat"],
    ["Next year","Año siguiente","Année suivante","Nächstes Jahr"],
    ["Drag to change view","Arrastra para cambiar la vista","Faites glisser pour changer de vue","Ziehen, um die Ansicht zu ändern"],
    ["Keyboard shortcuts","Atajos de teclado","Raccourcis clavier","Tastenkürzel"],
    ["Create event","Crear evento","Créer un événement","Termin erstellen"],
    ["Search dates or events","Buscar fechas o eventos","Rechercher des dates ou des événements","Daten oder Termine suchen"],
    ["Change calendar view. Drag up for month and week, down for full dates.","Cambiar la vista del calendario. Arrastra hacia arriba para ver el mes o la semana y hacia abajo para ver todas las fechas.","Changer la vue du calendrier. Faites glisser vers le haut pour afficher le mois ou la semaine, vers le bas pour afficher toutes les dates.","Kalenderansicht ändern. Nach oben ziehen für Monat und Woche, nach unten für alle Daten."],
    ["Upcoming agenda","Próximas actividades","Agenda à venir","Anstehende Termine"],
    ["Back to settings","Volver a ajustes","Retour aux paramètres","Zurück zu den Einstellungen"],
    ["Edit profile","Editar perfil","Modifier le profil","Profil bearbeiten"],
    ["Available languages","Idiomas disponibles","Langues disponibles","Verfügbare Sprachen"],
    ["Main navigation","Navegación principal","Navigation principale","Hauptnavigation"],
    ["Calex logo","Logotipo de Calex","Logo Calex","Calex-Logo"],
    ["Home","Inicio","Accueil","Startseite"],
    ["Previous mini-calendar month","Mes anterior del minicalendario","Mois précédent du mini-calendrier","Vorheriger Monat im Minikalender"],
    ["Next mini-calendar month","Mes siguiente del minicalendario","Mois suivant du mini-calendrier","Nächster Monat im Minikalender"],
    ["Close","Cerrar","Fermer","Schließen"],
    ["Event title","Título del evento","Titre de l’événement","Termintitel"],
    ["Event description","Descripción del evento","Description de l’événement","Terminbeschreibung"],
    ["Assistant conversation","Conversación con el asistente","Conversation avec l’assistant","Assistentenkonversation"],
    ["Send message","Enviar mensaje","Envoyer le message","Nachricht senden"],
    ["Choose a language or use Auto to follow your device's system language.","Elige un idioma o usa Automático para seguir el idioma del sistema de tu dispositivo.","Choisissez une langue ou utilisez Auto pour suivre la langue système de votre appareil.","Wähle eine Sprache oder nutze Auto, um der Systemsprache deines Geräts zu folgen."],
    ["Email or password was not accepted. If you originally used Google, choose Continue with Google: that account may not have a password. Otherwise use password reset or confirm your email.","No se aceptó el correo electrónico o la contraseña. Si usaste Google al principio, elige Continuar con Google: esa cuenta puede no tener contraseña. De lo contrario, restablece la contraseña o confirma tu correo.","L’adresse e-mail ou le mot de passe n’a pas été accepté. Si vous avez utilisé Google à l’origine, choisissez Continuer avec Google : ce compte peut ne pas avoir de mot de passe. Sinon, réinitialisez le mot de passe ou confirmez votre adresse e-mail.","E-Mail-Adresse oder Passwort wurde nicht akzeptiert. Wenn du ursprünglich Google verwendet hast, wähle Mit Google fortfahren: Für dieses Konto ist möglicherweise kein Passwort festgelegt. Andernfalls setze das Passwort zurück oder bestätige deine E-Mail-Adresse."],
    ["The authentication service has reached its sending limit. Wait before retrying. The app maintainer may need to configure custom SMTP; Google sign-in is another option.","El servicio de autenticación ha alcanzado el límite de envíos. Espera antes de volver a intentarlo. Es posible que la persona responsable deba configurar SMTP personalizado; también puedes iniciar sesión con Google.","Le service d’authentification a atteint sa limite d’envoi. Attendez avant de réessayer. Le responsable de l’application devra peut-être configurer un SMTP personnalisé ; la connexion Google est une autre option.","Der Authentifizierungsdienst hat sein Sendelimit erreicht. Warte vor einem erneuten Versuch. Die betreuende Person muss möglicherweise benutzerdefiniertes SMTP konfigurieren; die Google-Anmeldung ist eine weitere Option."],
    ["Confirmation requested. Check your inbox and spam folder. A successful request does not guarantee delivery; if nothing arrives, the maintainer must check Supabase email settings.","Se solicitó la confirmación. Revisa la bandeja de entrada y el correo no deseado. Una solicitud correcta no garantiza la entrega; si no llega nada, la persona responsable debe revisar los ajustes de correo de Supabase.","La confirmation a été demandée. Vérifiez votre boîte de réception et les courriers indésirables. Une demande réussie ne garantit pas la livraison ; si rien n’arrive, le responsable doit vérifier les paramètres e-mail de Supabase.","Bestätigung angefordert. Prüfe Posteingang und Spam-Ordner. Eine erfolgreiche Anfrage garantiert keine Zustellung; wenn nichts eintrifft, muss die betreuende Person die E-Mail-Einstellungen von Supabase prüfen."],
    ["Signup request accepted. If this address needs confirmation, check your inbox and spam folder. If you already used Google, choose Continue with Google instead: creating the account again does not set a password or require another confirmation.","Se aceptó la solicitud de registro. Si esta dirección necesita confirmación, revisa la bandeja de entrada y el correo no deseado. Si ya usaste Google, elige Continuar con Google: volver a crear la cuenta no establece una contraseña ni requiere otra confirmación.","La demande d’inscription a été acceptée. Si cette adresse doit être confirmée, vérifiez votre boîte de réception et les courriers indésirables. Si vous avez déjà utilisé Google, choisissez Continuer avec Google : recréer le compte ne définit pas de mot de passe et ne nécessite pas une nouvelle confirmation.","Die Registrierungsanfrage wurde angenommen. Wenn diese Adresse bestätigt werden muss, prüfe Posteingang und Spam-Ordner. Wenn du Google bereits verwendet hast, wähle Mit Google fortfahren: Das erneute Erstellen des Kontos legt kein Passwort fest und erfordert keine erneute Bestätigung."],
    ["That file is too large to import (5 MB max).","El archivo es demasiado grande para importarlo (máximo 5 MB).","Ce fichier est trop volumineux pour être importé (5 Mo maximum).","Diese Datei ist zu groß für den Import (maximal 5 MB)."],
    ["You're offline. Your calendar still works, and changes are saved on this device.","Estás sin conexión. El calendario sigue funcionando y los cambios se guardan en este dispositivo.","Vous êtes hors ligne. Le calendrier reste utilisable et les modifications sont enregistrées sur cet appareil.","Du bist offline. Dein Kalender funktioniert weiterhin, und Änderungen werden auf diesem Gerät gespeichert."],
    ["The assistant is taking too long. The request may still incur usage; retry only if needed.","El asistente está tardando demasiado. La solicitud aún puede generar consumo; vuelve a intentarlo solo si es necesario.","L’assistant met trop de temps à répondre. La requête peut tout de même entraîner une consommation ; ne réessayez que si nécessaire.","Der Assistent braucht zu lange. Für die Anfrage können weiterhin Nutzungskosten anfallen; versuche es nur bei Bedarf erneut."],
  );

// Locale labels for UI-generated previews and IANA time-zone region names.
  Object.assign(ASIAN_TRANSLATIONS, {
    "Preview": [
      "预览",
      "プレビュー",
      "미리보기"
    ],
    "Africa": [
      "非洲",
      "アフリカ",
      "아프리카"
    ],
    "America": [
      "美洲",
      "アメリカ",
      "아메리카"
    ],
    "Antarctica": [
      "南极洲",
      "南極大陸",
      "남극"
    ],
    "Arctic": [
      "北极",
      "北極",
      "북극"
    ],
    "Asia": [
      "亚洲",
      "アジア",
      "아시아"
    ],
    "Atlantic": [
      "大西洋",
      "大西洋",
      "대서양"
    ],
    "Australia": [
      "澳大利亚",
      "オーストラリア",
      "호주"
    ],
    "Europe": [
      "欧洲",
      "ヨーロッパ",
      "유럽"
    ],
    "Indian": [
      "印度洋",
      "インド洋",
      "인도양"
    ],
    "Pacific": [
      "太平洋",
      "太平洋",
      "태평양"
    ],
    "Etc": [
      "其他",
      "その他",
      "기타"
    ],
    "Global": [
      "全球",
      "グローバル",
      "전 세계"
    ]
  });
  ROWS.push(
    ["Preview","Vista previa","Aperçu","Vorschau"],
    ["Africa","África","Afrique","Afrika"],
    ["America","América","Amérique","Amerika"],
    ["Antarctica","Antártida","Antarctique","Antarktis"],
    ["Arctic","Ártico","Arctique","Arktis"],
    ["Asia","Asia","Asie","Asien"],
    ["Atlantic","Atlántico","Atlantique","Atlantik"],
    ["Australia","Australia","Australie","Australien"],
    ["Europe","Europa","Europe","Europa"],
    ["Indian","Índico","Indien","Indischer Ozean"],
    ["Pacific","Pacífico","Pacifique","Pazifik"],
    ["Etc","Otros","Autres","Sonstige"],
    ["Global","Global","Mondial","Weltweit"],
  );

    ROWS.push(
    ["EMAIL TO CALENDAR","Correo al calendario","E-mail vers le calendrier","E-Mail zu Kalender"],
    ["Inbox, connected to your calendar","Bandeja de entrada, conectada a tu calendario","Boîte de réception connectée à votre calendrier","Posteingang, mit deinem Kalender verbunden"],
    ["Find the details that matter, then turn an email into an editable event draft.","Encuentra los detalles importantes y convierte un correo en un borrador de evento editable.","Repérez les détails importants et transformez un e-mail en brouillon d’événement modifiable.","Finde die wichtigen Details und erstelle aus einer E-Mail einen bearbeitbaren Ereignisentwurf."],
    ["Read-only access","Acceso de solo lectura","Accès en lecture seule","Schreibgeschützter Zugriff"],
    ["Gmail access is optional. Calex reads messages only after you connect; its text is sent to Puter AI for extraction when you create an event draft. Review every draft before saving.","El acceso a Gmail es opcional. Calex solo lee mensajes después de que te conectes; su texto se envía a Puter AI para extraer los datos al crear un borrador de evento. Revisa cada borrador antes de guardarlo.","L’accès à Gmail est facultatif. Calex ne lit les messages qu’après votre connexion ; leur texte est envoyé à Puter AI pour en extraire les informations lors de la création d’un brouillon d’événement. Vérifiez chaque brouillon avant de l’enregistrer.","Der Gmail-Zugriff ist optional. Calex liest Nachrichten erst nach deiner Verbindung; beim Erstellen eines Ereignisentwurfs wird ihr Text zur Extraktion an Puter AI gesendet. Prüfe jeden Entwurf vor dem Speichern."],
    ["Email access is read-only. Calex never sends, deletes, or modifies your messages.","El acceso al correo es de solo lectura. Calex nunca envía, elimina ni modifica tus mensajes.","L’accès aux e-mails est en lecture seule. Calex n’envoie, ne supprime et ne modifie jamais vos messages.","Der E-Mail-Zugriff ist schreibgeschützt. Calex sendet, löscht oder ändert deine Nachrichten niemals."],
    ["Gmail connection needs setup","Es necesario configurar la conexión de Gmail","La connexion Gmail doit être configurée","Die Gmail-Verbindung muss eingerichtet werden"],
    ["Set a Google OAuth web client ID in gmail-config.js, enable the Gmail API in Google Cloud, and authorize this site’s origin. The app requests read-only Gmail access.","Configura un ID de cliente web de Google OAuth en gmail-config.js, habilita la API de Gmail en Google Cloud y autoriza el origen de este sitio. La aplicación solicita acceso de solo lectura a Gmail.","Configurez un ID client Web Google OAuth dans gmail-config.js, activez l’API Gmail dans Google Cloud et autorisez l’origine de ce site. L’application demande un accès Gmail en lecture seule.","Lege eine Google-OAuth-Webclient-ID in gmail-config.js fest, aktiviere die Gmail API in Google Cloud und autorisiere den Ursprung dieser Website. Die App fordert nur Lesezugriff auf Gmail an."],
    ["Inbox tools","Herramientas de bandeja de entrada","Outils de boîte de réception","Posteingangswerkzeuge"],
    ["Inbox","Bandeja de entrada","Boîte de réception","Posteingang"],
    ["Unread","No leídos","Non lus","Ungelesen"],
    ["Starred","Destacados","Avec étoile","Markiert"],
    ["Filter messages","Filtrar mensajes","Filtrer les messages","Nachrichten filtern"],
    ["Search Gmail inbox","Buscar en la bandeja de Gmail","Rechercher dans la boîte Gmail","Gmail-Posteingang durchsuchen"],
    ["Search mail by sender, subject, or keyword","Buscar correo por remitente, asunto o palabra clave","Rechercher par expéditeur, objet ou mot-clé","E-Mails nach Absender, Betreff oder Stichwort suchen"],
    ["Search","Buscar","Rechercher","Suchen"],
    ["Connect Gmail","Conectar Gmail","Connecter Gmail","Gmail verbinden"],
    ["Refresh","Actualizar","Actualiser","Aktualisieren"],
    ["Disconnect","Desconectar","Déconnecter","Trennen"],
    ["Enable AI extraction","Activar extracción con IA","Activer l’extraction par IA","KI-Extraktion aktivieren"],
    ["Messages","Mensajes","Messages","Nachrichten"],
    ["Loads more as you scroll","Carga más al desplazarte","Charge plus de messages en faisant défiler","Lädt beim Scrollen weitere Nachrichten"],
    ["No matching messages","No hay mensajes coincidentes","Aucun message correspondant","Keine passenden Nachrichten"],
    ["Connect Gmail to get started","Conecta Gmail para comenzar","Connectez Gmail pour commencer","Verbinde Gmail, um loszulegen"],
    ["Try another search or choose a different inbox filter.","Prueba otra búsqueda o elige otro filtro de bandeja de entrada.","Essayez une autre recherche ou choisissez un autre filtre de boîte de réception.","Versuche eine andere Suche oder wähle einen anderen Posteingangsfilter."],
    ["Your inbox will appear here after you grant read-only access.","Tu bandeja de entrada aparecerá aquí después de conceder acceso de solo lectura.","Votre boîte de réception apparaîtra ici après l’octroi de l’accès en lecture seule.","Dein Posteingang wird hier angezeigt, sobald du Lesezugriff gewährst."],
    ["No preview text is available.","No hay texto de vista previa disponible.","Aucun texte d’aperçu disponible.","Kein Vorschautext verfügbar."],
    ["Make event","Crear evento","Créer un événement","Ereignis erstellen"],
    ["Working…","Procesando…","Traitement…","Wird verarbeitet…"],
    ["Open in Gmail","Abrir en Gmail","Ouvrir dans Gmail","In Gmail öffnen"],
    ["Gmail is not connected.","Gmail no está conectado.","Gmail n’est pas connecté.","Gmail ist nicht verbunden."],
    ["Connect Gmail to show your inbox.","Conecta Gmail para ver tu bandeja de entrada.","Connectez Gmail pour afficher votre boîte de réception.","Verbinde Gmail, um deinen Posteingang anzuzeigen."],
    ["Loading emails…","Cargando correos…","Chargement des e-mails…","E-Mails werden geladen…"],
    ["Loading more emails…","Cargando más correos…","Chargement d’autres e-mails…","Weitere E-Mails werden geladen…"],
    ["Scroll to load more","Desplázate para cargar más","Faites défiler pour charger plus","Scrolle, um weitere zu laden"],
    ["No inbox messages matched that search.","Ningún mensaje de la bandeja coincide con esa búsqueda.","Aucun message de la boîte de réception ne correspond à cette recherche.","Keine Posteingangsnachrichten entsprechen dieser Suche."],
    ["Could not load Gmail messages.","No se pudieron cargar los mensajes de Gmail.","Impossible de charger les messages Gmail.","Gmail-Nachrichten konnten nicht geladen werden."],
    ["Connect Gmail to view your inbox.","Conecta Gmail para ver tu bandeja de entrada.","Connectez Gmail pour afficher votre boîte de réception.","Verbinde Gmail, um deinen Posteingang zu sehen."],
    ["Gmail is not configured for this deployment yet. The OAuth client ID must be added before connecting.","Gmail aún no está configurado para esta implementación. Debes añadir el ID de cliente OAuth antes de conectarte.","Gmail n’est pas encore configuré pour ce déploiement. L’ID client OAuth doit être ajouté avant la connexion.","Gmail ist für diese Bereitstellung noch nicht eingerichtet. Vor dem Verbinden muss die OAuth-Client-ID hinzugefügt werden."],
    ["Gmail disconnected. No email access token is stored by Calex.","Gmail desconectado. Calex no almacena ningún token de acceso al correo.","Gmail déconnecté. Calex ne stocke aucun jeton d’accès aux e-mails.","Gmail getrennt. Calex speichert kein E-Mail-Zugriffstoken."],
    ["That email is no longer in the visible inbox. Refresh and try again.","Ese correo ya no está en la bandeja visible. Actualiza e inténtalo de nuevo.","Cet e-mail n’est plus dans la boîte visible. Actualisez et réessayez.","Diese E-Mail ist nicht mehr im sichtbaren Posteingang. Aktualisiere und versuche es erneut."],
    ["Reading the selected email and extracting event details with Puter…","Leyendo el correo seleccionado y extrayendo los detalles del evento con Puter…","Lecture de l’e-mail sélectionné et extraction des détails de l’événement avec Puter…","Ausgewählte E-Mail wird gelesen und Ereignisdetails werden mit Puter extrahiert…"],
    ["This email has no readable message text. Try another email.","Este correo no contiene texto legible. Prueba con otro correo.","Cet e-mail ne contient aucun texte lisible. Essayez un autre e-mail.","Diese E-Mail enthält keinen lesbaren Nachrichtentext. Versuche eine andere E-Mail."],
    ["Puter could not identify a specific event in this email. Try another message or create the event manually.","Puter no pudo identificar un evento concreto en este correo. Prueba otro mensaje o crea el evento manualmente.","Puter n’a pas pu identifier d’événement précis dans cet e-mail. Essayez un autre message ou créez l’événement manuellement.","Puter konnte in dieser E-Mail kein konkretes Ereignis erkennen. Versuche eine andere Nachricht oder erstelle das Ereignis manuell."],
    ["Could not convert this email. Check Gmail and Puter access, then retry.","No se pudo convertir este correo. Comprueba el acceso a Gmail y Puter e inténtalo de nuevo.","Impossible de convertir cet e-mail. Vérifiez l’accès à Gmail et Puter, puis réessayez.","Diese E-Mail konnte nicht umgewandelt werden. Prüfe den Gmail- und Puter-Zugriff und versuche es erneut."],
    ["Connect Puter in the assistant first. This email will be processed after Puter is enabled.","Primero conecta Puter en el asistente. Este correo se procesará cuando Puter esté activado.","Connectez d’abord Puter dans l’assistant. Cet e-mail sera traité une fois Puter activé.","Verbinde zuerst Puter im Assistenten. Diese E-Mail wird verarbeitet, sobald Puter aktiviert ist."],
    ["Gmail is not configured for this deployment yet. The OAuth client ID must be added before connecting.","Gmail aún no está configurado para esta implementación. Debes añadir el ID de cliente OAuth antes de conectarte.","Gmail n’est pas encore configuré pour ce déploiement. L’ID client OAuth doit être ajouté avant la connexion.","Gmail ist für diese Bereitstellung noch nicht eingerichtet. Vor dem Verbinden muss die OAuth-Client-ID hinzugefügt werden."],
  );
  Object.assign(ASIAN_TRANSLATIONS, {
    "EMAIL TO CALENDAR": ["DEL CORREO AL CALENDARIO", "メールからカレンダーへ", "이메일에서 캘린더로"],
    "Inbox, connected to your calendar": ["收件箱，已连接到日历", "カレンダーに接続された受信トレイ", "캘린더에 연결된 받은편지함"],
    "Find the details that matter, then turn an email into an editable event draft.": ["提取重要信息，并将邮件转换为可编辑的日程草稿。", "必要な詳細を見つけ、メールを編集可能な予定の下書きに変換します。", "중요한 정보를 찾아 이메일을 수정 가능한 일정 초안으로 바꾸세요."],
    "Read-only access": ["只读访问", "読み取り専用アクセス", "읽기 전용 액세스"],
    "Gmail access is optional. Calex reads messages only after you connect; its text is sent to Puter AI for extraction when you create an event draft. Review every draft before saving.": ["Gmail 访问为可选。连接后 Calex 才会读取邮件；创建日程草稿时，邮件文本会发送给 Puter AI 提取信息。保存前请检查每份草稿。", "Gmail への接続は任意です。接続後にのみ Calex がメールを読み取り、予定の下書き作成時に本文を Puter AI に送信して情報を抽出します。保存前に下書きを確認してください。", "Gmail 연결은 선택 사항입니다. 연결한 후에만 Calex가 이메일을 읽으며, 일정 초안을 만들 때 텍스트를 Puter AI로 보내 정보를 추출합니다. 저장하기 전에 초안을 확인하세요."],
    "Email access is read-only. Calex never sends, deletes, or modifies your messages.": ["电子邮件仅可读取。Calex 不会发送、删除或修改你的邮件。", "メールへのアクセスは読み取り専用です。Calex がメールを送信、削除、変更することはありません。", "이메일 액세스는 읽기 전용입니다. Calex는 이메일을 보내거나 삭제하거나 수정하지 않습니다."],
    "Gmail connection needs setup": ["需要设置 Gmail 连接", "Gmail 接続の設定が必要です", "Gmail 연결 설정이 필요합니다"],
    "Inbox tools": ["收件箱工具", "受信トレイのツール", "받은편지함 도구"],
    "Inbox": ["收件箱", "受信トレイ", "받은편지함"],
    "Unread": ["未读", "未読", "읽지 않음"],
    "Starred": ["已加星标", "スター付き", "별표 표시"],
    "Filter messages": ["筛选邮件", "メールを絞り込む", "이메일 필터"],
    "Search Gmail inbox": ["搜索 Gmail 收件箱", "Gmail 受信トレイを検索", "Gmail 받은편지함 검색"],
    "Search mail by sender, subject, or keyword": ["按发件人、主题或关键词搜索邮件", "差出人、件名、キーワードでメールを検索", "보낸 사람, 제목 또는 키워드로 이메일 검색"],
    "Search": ["搜索", "検索", "검색"],
    "Connect Gmail": ["连接 Gmail", "Gmail を接続", "Gmail 연결"],
    "Refresh": ["刷新", "更新", "새로고침"],
    "Disconnect": ["断开连接", "接続を解除", "연결 해제"],
    "Enable AI extraction": ["启用 AI 提取", "AI 抽出を有効にする", "AI 추출 사용"],
    "Messages": ["邮件", "メッセージ", "메시지"],
    "Loads more as you scroll": ["滚动时加载更多", "スクロールするとさらに読み込み", "스크롤하면 더 불러옵니다"],
    "No matching messages": ["没有匹配的邮件", "一致するメールはありません", "일치하는 이메일이 없습니다"],
    "Connect Gmail to get started": ["连接 Gmail 以开始", "Gmail を接続して開始", "Gmail을 연결하여 시작"],
    "Try another search or choose a different inbox filter.": ["尝试其他搜索词或选择其他收件箱筛选条件。", "別のキーワードで検索するか、別の受信トレイフィルターを選択してください。", "다른 검색어를 입력하거나 다른 받은편지함 필터를 선택하세요."],
    "Your inbox will appear here after you grant read-only access.": ["授予只读访问权限后，收件箱会显示在这里。", "読み取り専用アクセスを許可すると、ここに受信トレイが表示されます。", "읽기 전용 액세스를 허용하면 받은편지함이 여기에 표시됩니다."],
    "No preview text is available.": ["没有可用的预览文本。", "プレビューできるテキストはありません。", "미리보기 텍스트가 없습니다."],
    "Make event": ["创建日程", "予定を作成", "일정 만들기"],
    "Working…": ["处理中…", "処理中…", "처리 중…"],
    "Open in Gmail": ["在 Gmail 中打开", "Gmail で開く", "Gmail에서 열기"],
    "Gmail is not connected.": ["Gmail 未连接。", "Gmail は接続されていません。", "Gmail이 연결되지 않았습니다."],
    "Connect Gmail to show your inbox.": ["连接 Gmail 以显示收件箱。", "受信トレイを表示するには Gmail を接続してください。", "받은편지함을 보려면 Gmail을 연결하세요."],
    "Loading emails…": ["正在加载邮件…", "メールを読み込み中…", "이메일을 불러오는 중…"],
    "Loading more emails…": ["正在加载更多邮件…", "さらにメールを読み込み中…", "이메일을 더 불러오는 중…"],
    "Scroll to load more": ["滚动以加载更多", "スクロールしてさらに読み込む", "스크롤하여 더 불러오기"],
    "No inbox messages matched that search.": ["收件箱中没有符合搜索条件的邮件。", "検索条件に一致する受信トレイのメールはありません。", "검색어와 일치하는 받은편지함 이메일이 없습니다."],
    "Connect Gmail to view your inbox.": ["连接 Gmail 以查看收件箱。", "受信トレイを表示するには Gmail を接続してください。", "받은편지함을 보려면 Gmail을 연결하세요."],
    "Gmail disconnected. No email access token is stored by Calex.": ["Gmail 已断开连接。Calex 不会存储电子邮件访问令牌。", "Gmail の接続を解除しました。Calex はメールのアクセストークンを保存しません。", "Gmail 연결이 해제되었습니다. Calex는 이메일 액세스 토큰을 저장하지 않습니다."],
    "Make event": ["创建日程", "予定を作成", "일정 만들기"],
    "Gmail is not configured for this deployment yet. The OAuth client ID must be added before connecting.": ["此部署尚未配置 Gmail。连接前必须添加 OAuth 客户端 ID。", "この環境では Gmail がまだ設定されていません。接続前に OAuth クライアント ID を追加してください。", "이 배포 환경에는 Gmail이 아직 설정되지 않았습니다. 연결하기 전에 OAuth 클라이언트 ID를 추가해야 합니다."]
  });

  const PHRASES = new Map();
    const REVERSE = new Map();
    const ORIGINAL_TEXT = new WeakMap();
    ROWS.forEach((row) => {
      const english = row[0];
      const values = {};
      const asian = ASIAN_TRANSLATIONS[english] || [];
      LANGUAGE_ORDER.forEach((code, index) => {
        const translatedValue = row[index] || (index >= 4 ? asian[index - 4] : "") || english;
        values[code] = translatedValue;
        const translated = normalise(translatedValue);
        if (translated && !REVERSE.has(translated)) REVERSE.set(translated, english);
      });
      PHRASES.set(normalise(english), values);
  });

  function normalise(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function resolveSystemLanguage() {
    const candidates = [];
    try {
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
      if (navigator.language) candidates.push(navigator.language);
    } catch (_) {}
    for (const candidate of candidates) {
      const base = String(candidate).toLowerCase().split(/[-_]/)[0];
      if (LANGUAGES[base]) return base;
    }
    return "en";
  }

  function readSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "auto" || LANGUAGES[saved]) return saved;
      const settings = JSON.parse(localStorage.getItem("calex-guest-settings-v1") || "{}");
      if (settings.language === "auto" || LANGUAGES[settings.language]) return settings.language;
    } catch (_) {}
    return "auto";
  }

  let currentPreference = readSavedLanguage();
  let currentLanguage = currentPreference === "auto" ? resolveSystemLanguage() : currentPreference;

  function locale() {
    return LANGUAGES[currentLanguage].locale;
  }

  function language() {
    return currentLanguage;
  }

  function preference() {
    return currentPreference;
  }

  function languageLabel(code) {
    if (code === "auto") return translate("Auto · System settings", currentLanguage);
    return (LANGUAGES[code] || LANGUAGES.en).label;
  }

  function isPreference(code) {
    return code === "auto" || !!LANGUAGES[code];
  }

  function translatePattern(source, code) {
    let match;
    const t = (key) => {
      const entry = PHRASES.get(normalise(key));
      return entry ? entry[code] : key;
    };
    match = source.match(/^Showing (\\d+) emails?(?:\\. (Scroll down to load more|All matching messages loaded)\\.)?$/);
    if (match) {
      const count = Number(match[1]);
      const suffix = match[2];
      const endings = {
        es: suffix === "Scroll down to load more" ? ". Desplázate para cargar más." : suffix ? ". Se han cargado todos los mensajes." : "",
        fr: suffix === "Scroll down to load more" ? ". Faites défiler pour charger plus." : suffix ? ". Tous les messages correspondants sont chargés." : "",
        de: suffix === "Scroll down to load more" ? ". Scrolle, um weitere zu laden." : suffix ? ". Alle passenden Nachrichten wurden geladen." : "",
        zh: suffix === "Scroll down to load more" ? "。滚动以加载更多。" : suffix ? "。所有匹配的邮件均已加载。" : "",
        ja: suffix === "Scroll down to load more" ? "。スクロールしてさらに読み込みます。" : suffix ? "。一致するメールをすべて読み込みました。" : "",
        ko: suffix === "Scroll down to load more" ? ". 스크롤하여 더 불러오세요." : suffix ? ". 일치하는 이메일을 모두 불러왔습니다." : ""
      };
      if (code === "en") return source;
      if (code === "es") return "Mostrando " + count + (count === 1 ? " correo" : " correos") + (endings[code] || "");
      if (code === "fr") return "Affichage de " + count + " e-mail" + (count === 1 ? "" : "s") + (endings[code] || "");
      if (code === "de") return count + " E-Mail" + (count === 1 ? "" : "s") + " werden angezeigt" + (endings[code] || "");
      if (code === "zh") return "正在显示 " + count + " 封邮件" + (endings[code] || "");
      if (code === "ja") return count + " 件のメールを表示中" + (endings[code] || "");
      if (code === "ko") return count + "개 이메일 표시 중" + (endings[code] || "");
    }

    match = source.match(/^Until (.+)$/);
    if (match) return t("Until") + " " + match[1];

    match = source.match(/^Signed in as (.+)$/);
    if (match) {
      if (code === "es") return "Sesión iniciada como " + match[1];
      if (code === "fr") return "Connecté en tant que " + match[1];
      if (code === "zh") return "已登录为 " + match[1];
      if (code === "ja") return match[1] + " としてログイン中";
      if (code === "ko") return match[1] + " 계정으로 로그인됨";
      return "Angemeldet als " + match[1];
    }

    match = source.match(/^Resend available in (\d+)s$/);
    if (match) {
      if (code === "es") return "Reenvío disponible en " + match[1] + " s";
      if (code === "fr") return "Nouvel envoi possible dans " + match[1] + " s";
      if (code === "zh") return match[1] + " 秒后可重新发送";
      if (code === "ja") return match[1] + "秒後に再送信できます";
      if (code === "ko") return match[1] + "초 후 다시 보낼 수 있습니다";
      return "Erneut senden in " + match[1] + " s möglich";
    }

    match = source.match(/^Synced at (.+?)\. Your calendar is up to date across devices\.$/);
    if (match) {
      if (code === "es") return "Sincronizado a las " + match[1] + ". Tu calendario está actualizado en todos tus dispositivos.";
      if (code === "fr") return "Synchronisé à " + match[1] + ". Votre calendrier est à jour sur tous vos appareils.";
      if (code === "zh") return "已于 " + match[1] + " 同步。你的日历在所有设备上均为最新。";
      if (code === "ja") return match[1] + " に同期しました。すべてのデバイスでカレンダーは最新です。";
      if (code === "ko") return match[1] + "에 동기화했습니다. 모든 기기의 캘린더가 최신 상태입니다.";
      return "Synchronisiert um " + match[1] + ". Dein Kalender ist auf allen Geräten aktuell.";
    }

    match = source.match(/^Imported (\d+) events?(?: · (\d+) duplicates skipped)?(?: · limit reached)?$/);
    if (match) {
      const count = Number(match[1]);
      const duplicates = match[2] ? Number(match[2]) : 0;
      const limited = source.includes("· limit reached");
      if (code === "es") return "Importados " + count + (count === 1 ? " evento" : " eventos") + (duplicates ? " · " + duplicates + " duplicados omitidos" : "") + (limited ? " · límite alcanzado" : "");
      if (code === "fr") return count + (count === 1 ? " événement importé" : " événements importés") + (duplicates ? " · " + duplicates + " doublons ignorés" : "") + (limited ? " · limite atteinte" : "");
      if (code === "zh") return "已导入 " + count + " 个事件" + (duplicates ? " · 已跳过 " + duplicates + " 个重复项" : "") + (limited ? " · 已达到上限" : "");
      if (code === "ja") return count + " 件の予定をインポートしました" + (duplicates ? " · 重複 " + duplicates + " 件をスキップ" : "") + (limited ? " · 上限に達しました" : "");
      if (code === "ko") return count + "개 일정을 가져왔습니다" + (duplicates ? " · 중복 " + duplicates + "개 건너뜀" : "") + (limited ? " · 한도에 도달함" : "");
      return count + (count === 1 ? " Termin importiert" : " Termine importiert") + (duplicates ? " · " + duplicates + " Duplikate übersprungen" : "") + (limited ? " · Limit erreicht" : "");
    }

    match = source.match(/^Calendar: (Full dates|Month|Week) view$/);
    if (match) return t("Calendar") + ": " + t(match[1]) + " " + t("view");

    match = source.match(/^(.+), (\d+) events?$/);
    if (match) {
      const count = Number(match[2]);
      const eventLabel = count === 1 ? t("event") : t("events");
      return match[1] + ", " + count + " " + eventLabel;
    }

    match = source.match(/^of (\d+) completed$/);
    if (match) {
      if (code === "es") return "de " + match[1] + " completados";
      if (code === "fr") return "sur " + match[1] + " terminés";
      if (code === "zh") return "共 " + match[1] + " 项已完成";
      if (code === "ja") return match[1] + " 件中完了";
      if (code === "ko") return match[1] + "개 중 완료";
      return "von " + match[1] + " erledigt";
    }

    match = source.match(/^Last updated: (.+)$/);
    if (match) {
      if (code === "es") return "Última actualización: " + match[1];
      if (code === "fr") return "Dernière mise à jour : " + match[1];
      if (code === "zh") return "最后更新：" + match[1];
      if (code === "ja") return "最終更新：" + match[1];
      if (code === "ko") return "마지막 업데이트: " + match[1];
      return "Zuletzt aktualisiert: " + match[1];
    }

    match = source.match(/^Effective date: (.+)$/);
    if (match) {
      if (code === "es") return "Fecha de entrada en vigor: " + match[1];
      if (code === "fr") return "Date d’entrée en vigueur : " + match[1];
      if (code === "zh") return "生效日期：" + match[1];
      if (code === "ja") return "発効日：" + match[1];
      if (code === "ko") return "시행일: " + match[1];
      return "Gültig ab: " + match[1];
    }

    match = source.match(/^To do · (\d+)$/);
    if (match) return t("To do") + " · " + match[1];

    match = source.match(/^Completed · (\d+)$/);
    if (match) return t("Completed") + " · " + match[1];

    match = source.match(/^Repeats every (\d+) (days|weeks|months|years)$/);
    if (match) {
      const n = Number(match[1]);
      const baseUnit = { days: "day", weeks: "week", months: "month", years: "year" }[match[2]];
      if (code === "es") {
        const unit = {
          day: n === 1 ? "día" : "días",
          week: n === 1 ? "semana" : "semanas",
          month: n === 1 ? "mes" : "meses",
          year: n === 1 ? "año" : "años",
        }[baseUnit];
        return "Se repite cada " + n + " " + unit;
      }
      if (code === "fr") {
        const unit = {
          day: n === 1 ? "jour" : "jours",
          week: n === 1 ? "semaine" : "semaines",
          month: n === 1 ? "mois" : "mois",
          year: n === 1 ? "an" : "ans",
        }[baseUnit];
        return "Répète " + (baseUnit === "week" ? "toutes les " : "tous les ") + n + " " + unit;
      }
      if (code === "de") {
        const unit = {
          day: n === 1 ? "Tag" : "Tage",
          week: n === 1 ? "Woche" : "Wochen",
          month: n === 1 ? "Monat" : "Monate",
          year: n === 1 ? "Jahr" : "Jahre",
        }[baseUnit];
        return "Wiederholt sich alle " + n + " " + unit;
      }
      const units = {
        zh: { day: "天", week: "周", month: "个月", year: "年" },
        ja: { day: "日", week: "週間", month: "か月", year: "年" },
        ko: { day: "일", week: "주", month: "개월", year: "년" },
      };
      if (units[code]) {
        const prefix = { zh: "每", ja: "毎", ko: "매" }[code];
        const suffix = { zh: "重复", ja: "繰り返し", ko: " 반복" }[code];
        return prefix + n + units[code][baseUnit] + suffix;
      }
    }

    match = source.match(/^Repeats (daily|weekly|monthly|yearly)$/);
    if (match) {
      const values = {
        daily: { es: "Se repite a diario", fr: "Répétition quotidienne", de: "Wiederholt sich täglich", zh: "每天重复", ja: "毎日繰り返し", ko: "매일 반복" },
        weekly: { es: "Se repite cada semana", fr: "Répétition hebdomadaire", de: "Wiederholt sich wöchentlich", zh: "每周重复", ja: "毎週繰り返し", ko: "매주 반복" },
        monthly: { es: "Se repite cada mes", fr: "Répétition mensuelle", de: "Wiederholt sich monatlich", zh: "每月重复", ja: "毎月繰り返し", ko: "매월 반복" },
        yearly: { es: "Se repite cada año", fr: "Répétition annuelle", de: "Wiederholt sich jährlich", zh: "每年重复", ja: "毎年繰り返し", ko: "매년 반복" },
      };
      return values[match[1]][code];
    }

    match = source.match(/^Mark (.+) completed$/);
    if (match) return t("Mark") + " " + match[1] + " " + t("completed");

    match = source.match(/^Edit (.+)$/);
    if (match) return t("Edit") + " " + match[1];

    match = source.match(/^Heads up: this overlaps with (.+)\. You can still save it\.$/);
    if (match) {
      if (code === "es") return "Aviso: se solapa con " + match[1] + ". Puedes guardarlo de todos modos.";
      if (code === "fr") return "Attention : ce créneau chevauche " + match[1] + ". Vous pouvez tout de même enregistrer.";
      if (code === "zh") return "提示：此时间与 " + match[1] + " 重叠。你仍然可以保存。";
      if (code === "ja") return "注意：この時間は " + match[1] + " と重複しています。そのまま保存できます。";
      if (code === "ko") return "주의: 이 시간이 " + match[1] + " 일정과 겹칩니다. 그래도 저장할 수 있습니다.";
      return "Achtung: Dieser Zeitraum überschneidet sich mit " + match[1] + ". Du kannst trotzdem speichern.";
    }

    match = source.match(/^(\d+) events?$/);
    if (match) {
      const n = Number(match[1]);
      const word = n === 1 ? t("event") : t("events");
      return n + " " + word;
    }

    match = source.match(/^(.+) · (\d+)$/);
    if (match) return t(match[1]) + " · " + match[2];

    match = source.match(/^(\d+) more$/);
    if (match) {
      if (code === "es") return "+" + match[1] + " más";
      if (code === "fr") return "+" + match[1] + " de plus";
      if (code === "zh") return "+" + match[1] + " 更多";
      if (code === "ja") return "ほか" + match[1] + "件";
      if (code === "ko") return "외 " + match[1] + "개";
      return "+" + match[1] + " weitere";
    }
    return null;
  }

  function englishSource(value) {
    const clean = normalise(value);
    if (PHRASES.has(clean)) return clean;
    if (REVERSE.has(clean)) return REVERSE.get(clean);
    return clean;
  }

  function translate(value, targetLanguage) {
    const code = LANGUAGES[targetLanguage] ? targetLanguage : currentLanguage;
    const original = String(value == null ? "" : value);
    const clean = normalise(original);
    if (!clean) return original;
    const source = englishSource(clean);
    const row = PHRASES.get(source);
    let translated = row ? row[code] : null;
    if (!translated && code !== "en") translated = translatePattern(source, code);
    if (!translated) return original;
    if (translated === clean) return original;
    const start = original.match(/^\s*/)[0];
    const end = original.match(/\s*$/)[0];
    return start + translated + end;
  }

  function isUserContent(node) {
    const parent = node && (node.nodeType === 1 ? node : node.parentElement);
    if (!parent) return false;
    return !!parent.closest(
      ".event-title, .cell-event, .chat-message > div, .assistant-draft strong, .profile-name, .profile-location, [data-user-content='true']",
    );
  }

  const ATTRS = ["placeholder", "title", "aria-label", "aria-description", "alt", "data-prompt"];

  function translateAttribute(element, attribute) {
    if (!element || !element.hasAttribute(attribute)) return;
    if (element.hasAttribute("data-user-content")) return;
    const before = element.getAttribute(attribute);
    const after = translate(before);
    if (after !== before) element.setAttribute(attribute, after);
  }

  function translateMarkedText(element) {
    const source = element?.getAttribute("data-i18n");
    if (!source || element.hasAttribute("data-user-content")) return;
    const expected = normalise(source);
    const node = Array.from(element.childNodes).find(
      (child) =>
        child.nodeType === 3 &&
        (normalise(child.nodeValue) === expected ||
          (ORIGINAL_TEXT.has(child) &&
            normalise(ORIGINAL_TEXT.get(child)) === expected)),
    );
    if (!node) return;
    if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue);
    const original = ORIGINAL_TEXT.get(node);
    const start = original.match(/^\s*/)[0];
    const end = original.match(/\s*$/)[0];
    const next = start + translate(source) + end;
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  function translateElement(element) {
    if (!element || element.nodeType !== 1) return;
    if (element.matches("[data-user-content='true']")) return;

    // data-i18n anchors fragile, nested UI labels to their English source phrase.
    // This also covers direct text nodes beside child elements, such as sidebar labels.
    const elements = [element, ...element.querySelectorAll("*")];
    elements.forEach((current) => {
      if (current.matches("[data-user-content='true']")) return;
      translateMarkedText(current);

      // Walk each element's direct text nodes to keep updates deterministic.
      Array.from(current.childNodes).forEach((node) => {
        if (node.nodeType !== 3 || isUserContent(node)) return;
        try {
          if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue);
          const source = ORIGINAL_TEXT.get(node);
          const translated = translate(source);
          if (translated !== node.nodeValue) node.nodeValue = translated;
        } catch (error) {
          console.error("Calex translation skipped a text node", error);
        }
      });

      ATTRS.forEach((attribute) => translateAttribute(current, attribute));
    });
  }

  function updateWeekdayLabels() {
    if (!document.body) return;
    const monday = new Date(2024, 0, 1, 12);
    const fullWeekday = new Intl.DateTimeFormat(locale(), { weekday: "short" });
    const narrowWeekday = new Intl.DateTimeFormat(locale(), { weekday: "narrow" });
    document.querySelectorAll("#calendarScreen .weekdays span").forEach((node, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const label = fullWeekday.format(day);
      if (node.textContent !== label) node.textContent = label;
    });
    document.querySelectorAll(".mini-weekdays span").forEach((node, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const label = narrowWeekday.format(day);
      if (node.textContent !== label) node.textContent = label;
    });
  }

  function translateDocument() {
    document.documentElement.lang = currentLanguage;
    translateElement(document.body);
    updateWeekdayLabels();
    const pageTitle = translate(document.title);
    if (pageTitle !== document.title) document.title = pageTitle;
  }

  function setLanguage(code, options) {
    const opts = options || {};
    if (!isPreference(code)) return false;
    const nextLanguage = code === "auto" ? resolveSystemLanguage() : code;
    const changed = currentLanguage !== nextLanguage || currentPreference !== code;
    currentPreference = code;
    currentLanguage = nextLanguage;
    if (opts.persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, code); } catch (_) {}
    }
    translateDocument();
    if (changed) {
      window.dispatchEvent(new CustomEvent("calex:language", { detail: code }));
      // App listeners may replace dynamic content while responding to the event.
      translateDocument();
    }
    return true;
  }

  window.addEventListener("languagechange", () => {
    if (currentPreference === "auto") setLanguage("auto", { persist: false });
  });

  function observe() {
    if (!document.body || window.__calexI18nObserver) return;
    translateDocument();
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") {
          if (isUserContent(record.target)) return;
          if (!ORIGINAL_TEXT.has(record.target))
            ORIGINAL_TEXT.set(record.target, record.target.nodeValue);
          const source = ORIGINAL_TEXT.get(record.target);
          const after = translate(source);
          if (after !== record.target.nodeValue) record.target.nodeValue = after;
          return;
        }
        if (record.type === "attributes") {
          translateAttribute(record.target, record.attributeName);
          return;
        }
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 3) {
            if (!isUserContent(node)) {
              if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue);
              const source = ORIGINAL_TEXT.get(node);
              const after = translate(source);
              if (after !== node.nodeValue) node.nodeValue = after;
            }
          } else if (node.nodeType === 1) {
            translateElement(node);
          }
        });
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
    window.__calexI18nObserver = observer;
  }

  function missingTranslations(targetLanguage) {
    const code = LANGUAGES[targetLanguage] ? targetLanguage : currentLanguage;
    return Array.from(PHRASES.entries())
      .filter(([, values]) => !values[code] || values[code] === values.en)
      .map(([source]) => source);
  }

  window.CalexI18n = {
    languages: LANGUAGES,
    missingTranslations,
    language,
    preference,
    isPreference,
    languageLabel,
    locale,
    translate,
    setLanguage,
    refresh: translateDocument,
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe, { once: true });
  } else {
    observe();
  }
})();