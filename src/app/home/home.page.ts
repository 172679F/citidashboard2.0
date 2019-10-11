import { Component , ViewChild, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { PopoverController, NavParams, Platform, NavController, AlertController} from '@ionic/angular';
import { HomePopoverComponent } from '../home-popover/home-popover.component';
import { DragulaService } from 'ng2-dragula';
import { ToastController } from '@ionic/angular';
import { isNgTemplate } from '@angular/compiler';
import { SourceListMap } from 'source-list-map';
import { Storage } from '@ionic/storage';
import { StorageService, Item, Preset, Box, Card, VisitSum, AwardSum, ProjectSum, Visits, Awards, Projects} from '../services/storage.service';
import { MenuController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { ThemeService } from '../services/theme.service';

const themes = {
  default: {

  },
  
  autumn: {
    primary: '#F78154',
    secondary: '#4D9078',
    tertiary: '#B4436C',
    light: '#FDE8DF',
    medium: '#FCD0A2',
    dark: '#B89876'
   },
   night: {
    primary: '#8CBA80',
    secondary: '#FCFF6C',
    tertiary: '#FE5F55',
    medium: '#BCC2C7',
    dark: '#F7F7FF',
    light: '#495867'
   },
   neon: {
    primary: '#39BFBD',
    secondary: '#4CE0B3',
    tertiary: '#FF5E79',
    light: '#F4EDF2',
    medium: '#B682A5',
    dark: '#34162A',
   },
   day: {
     primary: '#f7f70c',
     secondary: '#dede16',
     tertiary: '#1ec924',
     light: '#05f50d',
     medium: '#33a137',
     dark: '#3a873d'
   }
  };

declare var window;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {


  @ViewChild('doughnutChart', { static: true }) doughnutChart;

  authenticated = false;
  enterViewMode = false;
  exitViewMode = true;

  hideVisits = true;
  hideAwards = true;
  hideProjects = true;

  presetList: Preset[] = [];
  newPreset: Preset = <Preset>{};

  boxList: Box[] = [];
  newBox: Box = <Box>{};

  cardList: Card[] = [];
  newCard: Card = <Card>{}
  cardColor = "q1";
  cardValue = "visits";
  cardSize = "small";

  valueType = "sum";

  bars:any;
  colorArray: any;

  visitResults: VisitSum = <VisitSum>{};
  awardResults: AwardSum = <AwardSum>{};
  projectResults: ProjectSum = <ProjectSum>{};

  visitDetails: Visits = <Visits>{};
  awardDetails: Awards = <Awards>{};
  projectDetails: Projects = <Projects>{};

  visitsList: string;
  awardsList: string;
  projectsList: string;

  user = {
    name: 'admin',
    pw: 'admin'
  };

  constructor( public alertCtrl: AlertController, public navCtrl: NavController, public popoverController: PopoverController, private dragulaService: DragulaService, private toastController: ToastController, private storage: Storage, private storageService: StorageService, private plt: Platform, private authService: AuthService, private themeService: ThemeService) {

    this.plt.ready().then(() => {
      this.loadItems();
      this.loadPresets();
    })

    window.home = this;

    //Drag
    this.dragulaService.drag('bag')
    .subscribe(({ name, el, source }) => {
      
    });

    // Remove Model
    this.dragulaService.removeModel('bag')
    .subscribe(({ item }) => {
      this.toastController.create({
        message: 'Removed: ' + item.value,
        duration: 2000
      }).then(toast => toast.present());
    });

    //Drop Model
    this.dragulaService.dropModel('bag')
      .subscribe(({ item }) => {
      });

    // Create Group
    this.dragulaService.createGroup('bag', {
      removeOnSpill: false
    });  
  }

  ngOnInit() {
    this.authService.getUserSubject().subscribe(authState => {
      this.authenticated = authState ? true : false;

      this.storageService.getVisitsSum()
      .subscribe(visits => this.visitResults = visits);

      this.storageService.getAwardsSum()
      .subscribe(awards => this.awardResults = awards);

      this.storageService.getProjectsSum()
      .subscribe(projects => this.projectResults = projects);


      this.storageService.getVisitsList()
      .subscribe(visitdetails => this.visitDetails = visitdetails);

      this.storageService.getAwardsList()
      .subscribe(awarddetails => this.awardDetails = awarddetails);

      this.storageService.getProjectsList()
      .subscribe(projectdetails => this.projectDetails = projectdetails);

    });
  }

  displayVisitSum() {
    this.storageService.getVisitsSum()
      .subscribe(visits => this.visitResults = visits);  
  }


  // loginAdmin(name, pw) {
  //   this.authService.login(name, pw);
  // }

  loginAdmin(name) {
    this.authService.loginTest('admin', 'admin');
  }

  loginAccount() {
    try {
      this.authService.loginTest(this.user.name, this.user.pw);
      // this.isHidden = true;
    }
    catch {
      
    }
    
  }

  loginUser() {
    this.authService.login('user');
  }

  logout() {
    this.authService.logout();
  }

  enterView() {
    this.enterViewMode = true;
    this.exitViewMode = false;
  }

  exitView() {
    this.enterViewMode = false;
    this.exitViewMode = true;
  }

  loadCards() {
    this.storageService.getCards().then(Cards => {
      this.cardList = Cards;
    });
  }

  loadItems() {
    this.storageService.getItems().then(Boxes => {
      this.boxList = Boxes;
    });
  }

  loadPresets() {
    this.storageService.getPresets().then(Presets => {
      this.presetList = Presets;
    });
  }

  loadSelectedPreset(boxList) {
    this.boxList = boxList;
    this.storageService.selectPreset(boxList);
  }



  savePreset(boxList) {
    this.newPreset.presetId = 1;
    this.newPreset.presetBoxList = boxList;
    
    this.storageService.addPreset(this.newPreset).then(box => {
      this.newPreset = <Preset>{}; //clear newPreset
      this.toastController.create({
        message: 'Preset Saved',
        duration: 2000
      }).then(toast => toast.present());
      this.loadPresets();
      
    });
  }

  // Delete boxes
  clearBoxes() {
    this.storageService.deleteBoxes();
    this.boxList = [];
  }


  addNewBox() {
    this.newBox.boxId = Date.now();

    switch (this.cardValue) {
      case 'visits':
        this.newCard.value = this.visitResults.visitsSum;
        this.newCard.title = 'Visits';
        this.newCard.icon = 'person';
        break;
      case 'awards':
        this.newCard.value = this.awardResults.awardsSum;
        this.newCard.title = 'Awards';
        this.newCard.icon = 'trophy';
        break;
      case 'projects':
        this.newCard.value = this.projectResults.projectsSum;
        this.newCard.title = 'Projects';
        this.newCard.icon = 'book';
        break; 

      case 'visitdetails':
        this.newCard.value = "visitDetails";
        this.newCard.title = 'Visits';
        this.newCard.icon = 'person';
        break; 

      case 'awarddetails':
        this.newCard.value = "awardDetails";
        this.newCard.title = 'Awards';
        this.newCard.icon = 'trophy';
        break; 

      case 'projectdetails':
        this.newCard.value = "projectDetails";
        this.newCard.title = 'Projects';
        this.newCard.icon = 'book';
        break; 
    }

    switch (this.cardColor) {
      case 'q1':
        this.newCard.color = 'primary';
        break;
      case 'q2':
        this.newCard.color = 'warning';
        break;
      case 'q3':
        this.newCard.color = 'danger';
        break;
      case 'q4':
        this.newCard.color = 'success';
        break;       
      case 'q5':
      this.newCard.color = 'dark';
      break;   
    }
    this.newBox.cardList = [ this.newCard ];

    this.storageService.addBox(this.newBox).then(box => {
      this.newBox = <Box>{}; //clear newBox
      this.toastController.create({
        message: 'Box Added!',
        duration: 2000
      }).then(toast => toast.present());
      this.loadItems(); // Or add it to the array directly
      
    });
  }

  addNewCard(box: Box) {
    this.newCard.cardId = Date.now();

    switch (this.cardValue) {
      case 'visits':
        this.newCard.value = this.visitResults.visitsSum;
        this.newCard.title = 'Visits';
        this.newCard.icon = 'person';
        break;
      case 'awards':
        this.newCard.value = this.awardResults.awardsSum;
        this.newCard.title = 'Awards';
        this.newCard.icon = 'trophy';
        break;
      case 'projects':
        this.newCard.value = this.projectResults.projectsSum;
        this.newCard.title = 'Projects';
        this.newCard.icon = 'book';
        break; 

      case 'visitdetails':
        this.newCard.value = "visitDetails";
        this.newCard.title = 'Visits';
        this.newCard.icon = 'person';
        break; 

      case 'awarddetails':
        this.newCard.value = "awardDetails";
        this.newCard.title = 'Awards';
        this.newCard.icon = 'trophy';
        break; 

      case 'projectdetails':
        this.newCard.value = this.newCard.value = "projectDetails";
        this.newCard.title = 'Projects';
        this.newCard.icon = 'book';
        break; 
    }

    switch (this.cardColor) {
      case 'q1':
        this.newCard.color = 'primary';
        break;
      case 'q2':
        this.newCard.color = 'warning';
        break;
      case 'q3':
        this.newCard.color = 'danger';
        break;
      case 'q4':
        this.newCard.color = 'success';
        break;       
      case 'q5':
      this.newCard.color = 'dark';
      break;   
    }

    box.cardList.push(this.newCard);  
    
    this.storageService.updateBox(box).then(box => {
      this.toastController.create({
        message: 'Card Added!',
        duration: 2000
      }).then(toast => toast.present());
      this.loadItems();
    });
  }

  updateSumData(box: Box, card:Card) {
    const index = box.cardList.indexOf(card);

    if (index != -1) {
      if (card.title == 'Awards') {
        card.value = this.awardResults.awardsSum;
        this.hideVisits = true;
        this.hideAwards = false;
        this.hideProjects = true;
      }
      else if (card.title == 'Visits') {
        card.value = this.visitResults.visitsSum;
        this.hideVisits = false;
        this.hideAwards = true;
        this.hideProjects = true;
      }
      else if (card.title == 'Projects') {
        card.value = this.projectResults.projectsSum;
        this.hideVisits = true;
        this.hideAwards = true;
        this.hideProjects = false;
      }
      
      this.storageService.updateBox(box).then(box => {
        this.toastController.create({
          message: card.title + ' Refreshed!',
          duration: 3000
        }).then(toast => toast.present());
        this.loadItems();
      });

      
    }
    
  }

  deleteCard(box: Box, card: Card) {
    const index = box.cardList.indexOf(card);

    if (index != -1) {
      box.cardList.splice(index, 1)

      this.storageService.updateBox(box).then(box => {
        this.toastController.create({
          message: card.title + ' Deleted!',
          duration: 3000
        }).then(toast => toast.present());
        this.loadItems();
      });
    }
    else {
      this.toastController.create({
        message: card.title + ' could not be deleted Index: ' + index.toString(),
        duration: 5000
      }).then(toast => toast.present());
    }

    
  }

  addTodo() {

    switch (this.cardColor) {
      case 'q1':
        this.newCard.color = "primary";
        break;
      case 'q2':
        this.newCard.color = 'warning';
        break;
      case 'q3':
        this.newCard.color = 'danger';
        break;
      case 'q4':
        this.newCard.color = 'success';
        break;       
      case 'q5':
      this.newCard.color = 'dark';
      break;   
    }

    switch (this.cardSize) {
      case 'small':
        this.newCard.size = "3";
        break;
      case 'medium':
        this.newCard.size = '4';
        break;
      case 'large':
        this.newCard.size = '6';
        break;      
    }
    

    this.newBox.boxId = Date.now();
    this.newBox.cardList = [ this.newCard ];
 
    this.storageService.addBox(this.newBox).then(box => {
      this.newBox = <Box>{}; //clear newBox
      this.toastController.create({
        message: 'Box Added!',
        duration: 2000
      }).then(toast => toast.present());
      this.loadItems(); // Or add it to the array directly
      
    });

    // this[this.selectedQuadrant].push(this.todo);
    // this.todo = { value: '', color: '' };
    // this.lists.push([ { value: '9', color: 'warning' } ]);
  }

  // Delete Box
  deleteItem(box: Box) {
    this.storageService.deleteItem(box.boxId).then(box => {
      this.toastController.create({
        message: 'Box removed!',
        duration: 2000
      }).then(toast => toast.present());
      this.loadItems(); // Or splice it from the array directly
    });
  }


  // todo = { value: '', color: '' };
  // selectedQuadrant = 'q1';


  async presentPopover(card) {
    if (card.title == 'Awards') {
      this.hideVisits = true;
      this.hideAwards = false;
      this.hideProjects = true;
    }
    else if (card.title == 'Visits') {
      this.hideAwards == true;
      this.hideVisits = false;
      this.hideProjects = true;
    }
    else if (card.title = 'Projects') {
      this.hideProjects = false;
      this.hideVisits = true;
      this.hideAwards = true;
    }

    const popover = await this.popoverController.create({
      component: HomePopoverComponent,
      componentProps: {homeref:this}
      
    });
    return await popover.present();
  }

  ionViewDidEnter() {
    this.createDoughnutChart();
  }
  
  generateColorArray(num) {
    this.colorArray = [];
    for (let i = 0; i < num; i++) {
      this.colorArray.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }
  }

  createDoughnutChart() {
    var colorArray = [];
    for (let i = 0; i < 5; i++) {
      colorArray.push('#' + Math.floor(Math.random() * 16777215).toString(16));
    }
    this.bars = new Chart(this.doughnutChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Retail/Shop', 'Food', 'Transport', 'Withdrawals', 'Transfers'],
        datasets: [{
          label: 'Money Spent ($)',
          data: [100, 200, 50, 150, 65],
          backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"], // array should have same number of elements as number of dataset
          borderColor: '#FFFFFF',// array should have same number of elements as number of dataset
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  changeTheme(name) {
    this.themeService.setTheme(themes[name]);
  }

}
