///////////////////////////////
//  LZ Server 'LZClient1' (Serial)  //
///////////////////////////////

const String LineEnd = String((char)13);
String StringBuf;

const String Separator = ":";
const String ItemSeparator = ";";

// pin definitions: remove // and write the pin (for example 8 or A0) of the tags that use a pin
#define PIN_LEDTAG 2
#define PIN_BUTTONTAG 0
#define PIN_ANALOGTAG 34

typedef struct TTags {
        String TagName;
        int TagValue;
 };

TTags Tags[3];

void ScanLZPacked(void) {

  char inChar;
  String ValueString;

    if ( Serial.available() )
    {
            inChar = Serial.read(); // Read a character
            StringBuf += inChar;
            if (StringBuf.endsWith(LineEnd))
            {
                // one line = one or more items separated by ItemSeparator:  A:100 (write)  A: (read)  A:;B:;C: (read many)  *: (read all)  B*: (read the names that start with B)
                String Line = StringBuf.substring(0, StringBuf.length() - LineEnd.length());
                String Reply = "";
                int start = 0;
                while ( start <= (int)Line.length() ) {
                  int endAt = Line.indexOf(ItemSeparator, start);
                  if ( endAt < 0 ) endAt = Line.length();
                  String Item = Line.substring(start, endAt);
                  start = endAt + 1;
                  if ( Item.endsWith("*" + Separator) ) {  // <prefix>*: all tags whose name starts with prefix (*: = all)
                    String Prefix = Item.substring(0, Item.length() - 1 - Separator.length());
                    Prefix.toUpperCase();
                    for ( int i = 0; i < 3 ; i++ ){
                      String Upper = Tags[i].TagName;
                      Upper.toUpperCase();
                      if ( Upper.startsWith(Prefix) ) {
                        if ( Reply.length() > 0 ) Reply += ItemSeparator;
                        Reply += Tags[i].TagName + Separator + Tags[i].TagValue;
                      }
                    }
                    continue;
                  }
                  for ( int i = 0; i < 3 ; i++ ){
                    if ( Item.startsWith(Tags[i].TagName + Separator) ) {
                      ValueString = Item.substring( (Tags[i].TagName + Separator).length() );
                      if ( ValueString.length() > 0 ) Tags[i].TagValue = ValueString.toInt();
                      else {
                        if ( Reply.length() > 0 ) Reply += ItemSeparator;
                        Reply += Tags[i].TagName + Separator + Tags[i].TagValue;
                      }
                      break;
                    };// endif
                  };//end for
                }// end while items
                if ( Reply.length() > 0 ) Serial.print(Reply + LineEnd);
               StringBuf = "";
            }// end if
    }// end while
}// end ReadFromScada


void setup() {

  // setup Serial
  Serial.begin(115200); // BaudRate of 'SerialPort1'

  // define tags
  Tags[0] = (TTags) {"Led",0};  // LedTag
  Tags[1] = (TTags) {"Button",0};  // ButtonTag
  Tags[2] = (TTags) {"Analog",0};  // AnalogTag

  // set pin modes: remove // from the line you need (input or output), delete the other
  pinMode(PIN_LEDTAG, OUTPUT);   // Tags[0] 'LedTag' output
  pinMode(PIN_BUTTONTAG, INPUT);    // Tags[1] 'ButtonTag' input
  pinMode(PIN_ANALOGTAG, INPUT);    // Tags[2] 'AnalogTag' input
}

void loop() {

  // pins: remove // from the line that matches the pin mode in setup, delete the others
  digitalWrite(PIN_LEDTAG, Tags[0].TagValue == 1 ? HIGH : LOW);   // LedTag digital output
  Tags[1].TagValue = (int)digitalRead(PIN_BUTTONTAG);   // ButtonTag digital input
  Tags[2].TagValue = (int)analogRead(PIN_ANALOGTAG);    // AnalogTag analog input

  ScanLZPacked();

  delay(10);

  // User Task
  // ...
}
