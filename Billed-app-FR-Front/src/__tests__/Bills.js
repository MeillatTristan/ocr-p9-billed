/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import { bills } from "../fixtures/bills.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from '@testing-library/user-event'
import "@testing-library/jest-dom";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";

jest.mock("../app/store", () => mockStore)
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.getAttribute('class')).toMatch('active-icon')

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => (a.date < b.date) ? 1 : -1) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("I click on new bill", () => {
      test(('Then open popup form new bill'), async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const bills = new Bills({ document, onNavigate, store: null, localStorage  });

        const clickNewBill = jest.fn((e) => bills.handleClickNewBill())

        const button = screen.getByTestId("btn-new-bill")
        button.addEventListener('click', clickNewBill);
        userEvent.click(button)
        expect(clickNewBill).toHaveBeenCalled()
        await waitFor(() => screen.getByTestId("form-new-bill"))
        expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      })
    })

    describe('i click on icon eye', () =>
      test(('Then open popup modaleFile'), async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        const billsTest = new Bills({ document, onNavigate, store: null, localStorage  });
        const clickIconEye = jest.fn((icon) => billsTest.handleClickIconEye(icon))

        document.body.innerHTML = BillsUI({ data: bills })
        const eyes = screen.getAllByTestId("icon-eye")
        const modaleFile = document.getElementById("modaleFile")
        $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))
        eyes.forEach(eye => {
          eye.addEventListener('click', clickIconEye(eye));
          userEvent.click(eye)
          expect(clickIconEye).toHaveBeenCalled()

          expect(modaleFile.getAttribute('class')).toMatch('show')
        });
      })
    )

    
  })
})

