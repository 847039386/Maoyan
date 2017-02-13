interface IReptileDates {
    currentYear :number;
    currentMonth :number;
    currentDay :number ;
    currentDates : string[];
}

export class ReptileDates implements IReptileDates {
    currentYear :number;
    currentMonth :number;
    currentDay :number ;
    currentDates : string[];
    init(currentDate :number ,currentMonth :number ,currentDay :number ,currentDates :string[]){
        this.currentYear = currentDate;
        this.currentMonth = currentMonth;
        this.currentDay = currentDay;
        this.currentDates = currentDates;
    }
}


