// יצירות: כל נושא מהידע, ההבנה והיישום של האפליקציה הופך לחדר עם יצירות בתשעה עיצובים.
// הרכיב המשותף <app-creations> (AppOfApp-GH/public/creations.js) מציג אותן, מדפיס A4 ומעלה לחדר ב-TAARUCHA.
// הנתונים: public/creations.json, נגזר מהמאגר ב-tools/creations.ts.
export default function Creations() {
  return (
    <main className="app-main creations-page">
      <app-creations src="./creations.json" heading="מה האמירות יוצרות" />
    </main>
  );
}
