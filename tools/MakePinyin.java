import net.sourceforge.pinyin4j.PinyinHelper;
import net.sourceforge.pinyin4j.format.*;
public class MakePinyin {
 public static void main(String[] args) throws Exception {
  HanyuPinyinOutputFormat f=new HanyuPinyinOutputFormat();f.setCaseType(HanyuPinyinCaseType.LOWERCASE);f.setToneType(HanyuPinyinToneType.WITHOUT_TONE);f.setVCharType(HanyuPinyinVCharType.WITH_U_UNICODE);
  java.io.PrintWriter w=new java.io.PrintWriter(new java.io.OutputStreamWriter(System.out,java.nio.charset.StandardCharsets.UTF_8));w.print("{");boolean first=true;
  for(char c=0x4e00;c<=0x9fff;c++){String[] p=PinyinHelper.toHanyuPinyinStringArray(c,f);if(p==null||p.length==0)continue;if(!first)w.print(",");first=false;w.print("\""+c+"\":\""+p[0]+"\"");}w.println("}");w.flush();
 }
}
