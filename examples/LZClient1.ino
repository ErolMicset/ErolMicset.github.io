//////////////////////////////////////
//  LZ Server 'LZClient1' (Serial)  //
/////////////////////////////////////


const String LineEnd = String((char)13);
String StringBuf;

const String Separator = ":";

// pin definitions
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
                String Line = StringBuf;
                for ( int i = 0; i < 3 ; i++ ){
                  if ( Line.startsWith(Tags[i].TagName + Separator) ) {
                    ValueString = Line.substring( (Tags[i].TagName + Separator).length() , Line.length() - LineEnd.length());
                    if ( ValueString.length() > 0 ) Tags[i].TagValue = ValueString.toInt();
                    else                            Serial.print(Tags[i].TagName + Separator + Tags[i].TagValue + LineEnd);
                    break;
                  };// endif
                };//end for
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

  // set pin modes
  pinMode(PIN_LEDTAG, OUTPUT);           // Tags[0] 'LedTag'
  pinMode(PIN_BUTTONTAG, INPUT);           // Tags[1] 'ButtonTag'
  pinMode(PIN_ANALOGTAG, INPUT);           // Tags[2] 'AnalogTag'
}

void loop() {

  if( Tags[0].TagValue == 1 ) digitalWrite(PIN_LEDTAG, HIGH);  else  digitalWrite(PIN_LEDTAG, LOW); // LedTag
  Tags[1].TagValue = (int)digitalRead(PIN_BUTTONTAG); // ButtonTag
  Tags[2].TagValue = (int)analogRead(PIN_ANALOGTAG); // AnalogTag

  ScanLZPacked();

  delay(10);

  // User Task
  // ...
}
